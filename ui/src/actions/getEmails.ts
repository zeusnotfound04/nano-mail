
"use server";

import { simpleParser } from "mailparser";
import {prisma} from "@/lib/prisma";
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

export async function searchEmails(rcptQuery: string) {
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
        emails.map(async (email: PrismaEmail) => {
          const parsedData = await parseEmailOptimized(email.body || "");
          return {
            id: email.id,
            date: email.created_at || new Date(),
            mail_from: cleanSenderEmail(email.sender) || "",
            rcpt_to: email.recipients,
            subject: parsedData.subject || email.subject || "",
            data: parsedData,
          };
        })
      );
      return output;
    } catch (dbError: unknown) {
      if (dbError instanceof Error) {
        console.error("Database query error:", dbError);
        throw new Error(`Database query failed: ${dbError.message}`);
      } else {
        console.error("Unknown database query error:", dbError);
        throw new Error("Database query failed due to an unknown error.");
      }
    }
    
  } catch (error) {
    console.error("Error in searchEmails:", error);
    return [];
  }
}

interface EmailContent {
  text: string;
  html: string;
  text_as_html: string;
  subject: string;
  date: Date;
}

export async function parseEmailOptimized(data: string): Promise<EmailContent> {
  try {
    const parsed = await simpleParser(data);
    
    return {
      text: parsed.text ?? "",
      html: parsed.html || "",
      text_as_html: parsed.textAsHtml ?? "",
      subject: parsed.subject ?? "",
      date: parsed.date ?? new Date(),
    };
  } catch (error) {
    console.error("Error parsing email", error);
    return {
      text: data,
      html: "",
      text_as_html: data.replace(/\n/g, '<br>'),
      subject: "",
      date: new Date(),
    };
  }
}

export async function parseEmail(data: string): Promise<EmailContent> {
  return parseEmailOptimized(data);
}
