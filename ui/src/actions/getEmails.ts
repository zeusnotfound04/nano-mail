
"use server";

import { Attachment, simpleParser } from "mailparser";



import {prisma} from "@/lib/prisma";
import { unstable_cache } from "next/cache"; 

import { cleanSenderEmail } from "./mailParser";

type PrismaEmail = {
  id: number;
  sender: string | null;
  recipients: string[];
  subject: string | null;
  body: string | null;
  size: bigint | null;
  created_at: Date | null;
}

function safeStringify(obj: any): string {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }, 2);
}

export const searchEmails = unstable_cache(
  async (rcptQuery: string) => {
    
    try {
        if (!prisma) {
        console.error("Prisma client is not initialized");
        throw new Error("Database connection error");
      }
      
  
      const sanitizedQuery = rcptQuery.trim().toLowerCase();
      if (!sanitizedQuery) {
        console.error("Empty recipient query");
        return [];
      }
      
      
      const fullEmail = sanitizedQuery.includes('@') 
        ? sanitizedQuery 
        : `${sanitizedQuery}@zeus.nanomail.live`;
      
      
      try {
        const emails = await prisma.emails.findMany({
          where: {
            recipients: {
              has: fullEmail, 
            },
          },
          select: {
            id: true,
            sender: true,
            recipients: true,
            subject: true,
            body: true,
            size: true,
            created_at: true,
          },
          take: 100, 
          orderBy: {
            created_at: "desc",
          },
        });
        
        
        if (emails.length === 0) {
          return [];
        }

        const output = await Promise.all(
          emails.map(async (email: PrismaEmail) => ({
            
            id: email.id,
            date: email.created_at || new Date(),
            mail_from: cleanSenderEmail(email.sender ) || "",
            rcpt_to: email.recipients,
            subject: email.subject || "",
            data: await parseEmail(email.body || ""),
          }))
        );
        return output;
      } catch (dbError : any) {
        console.error("Database query error:", dbError);
        throw new Error(`Database query failed: ${dbError.message}`);
      }
    } catch (error) {
      console.error("Error in searchEmails:", error);
      return [];
    }
  },
  ["searchEmails"], 
  {
    revalidate: 60, 
    tags: ["emails"], 
  }
);
interface EmailContent {
  text: string;
  html: string;
  text_as_html: string;
  attachments: Attachment[];
  date: Date;
}


export async function parseEmail(data: string): Promise<EmailContent> {
  try {
    
    const parsed = await simpleParser(data);
    
    const formattedParsedData = {
      text: parsed.text ?? "",
      html: parsed.html || "",
      text_as_html: parsed.textAsHtml ?? "",
      attachments: parsed.attachments ?? [],
      date: parsed.date ?? new Date(),
    }
    return formattedParsedData
  } catch (error) {
    console.error("Error parsing email", error);
    throw error;
  }
}
