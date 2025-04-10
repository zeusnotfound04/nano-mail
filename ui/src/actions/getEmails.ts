
"use server";
//@ts-ignore
import { Attachment, simpleParser } from "mailparser";
// app/actions/searchEmails.ts


import {prisma} from "@/lib/prisma";
import { unstable_cache } from "next/cache"; 
import type { Email } from "@/types";

// Define a type that matches what Prisma returns
type PrismaEmail = {
  id: number;
  sender: string | null;
  recipients: string[];
  subject: string | null;
  body: string | null;
  size: bigint | null;
  created_at: Date | null;
}

// Helper function to safely stringify objects with BigInt values
function safeStringify(obj: any): string {
  return JSON.stringify(obj, (key, value) => {
    // Convert BigInt to String for JSON serialization
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }, 2);
}

export const searchEmails = unstable_cache(
  async (rcptQuery: string) => {
    console.log("Starting searchEmails for:", rcptQuery);
    
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
      
      console.log("Searching for emails with recipient:", fullEmail);
      
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
        
        console.log(`Query completed. Found ${emails.length} emails for ${fullEmail}`);
        
        if (emails.length === 0) {
          return [];
        }

        console.log("Processing emails with parseEmail...");
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
        console.log("Parsed Output successfully. 🐉🐉🐉🐉🚀" , output);
        // console.log(`Successfully processed ${output.length} emails for ${fullEmail}`);
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
    // console.log("Parsing email data...::::" , data );
    const parsed = await simpleParser(data);
    // console.log("Parsed email data successfully. 🐉🐉🐉🐉🚀" , parsed);
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

function cleanSenderEmail(senderString: string | null): string {
  if (!senderString) return "";
  
  senderString = senderString.replace(/\s+SIZE=\d+$/, '');

  const emailMatch = senderString.match(/<([^>]+)>/);
  if (emailMatch && emailMatch[1]) {
    return emailMatch[1];
  }
  
  
  if (senderString.includes('@')) {
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const match = senderString.match(emailRegex);
    if (match && match[0]) {
      return match[0];
    }
  }
  // console.log("sender's email ::::" , senderString.trim())
  return senderString.trim();
}