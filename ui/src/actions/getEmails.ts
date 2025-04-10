// app/actions/searchEmails.ts
"use server";

import {prisma} from "@/lib/prisma";
import { parseEmail } from "@/actions/mailParser";
import { unstable_cache } from "next/cache"; // Next.js 13/14 caching
import { Email } from "@/types";

export const searchEmails = unstable_cache(
  async (rcptQuery: string) => {
    try {
      const emails = await prisma.emails.findMany({
        where: {
          recipients: {
            has: rcptQuery, 
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
performance
      const output = await Promise.all(
        emails.map(async (email : Email) => ({
          id: email.id,
          date: email.created_at,
          mail_from: email.sender,
          rcpt_to: email.recipients,
          data: await parseEmail(email.body),
        }))
      );

      return output;
    } catch (error) {
      console.error("Error fetching emails", error);
      throw new Error("Error fetching emails");
    }
  },
  ["searchEmails"], 
  {
    revalidate: 60, 
    tags: ["emails"], 
  }
);
