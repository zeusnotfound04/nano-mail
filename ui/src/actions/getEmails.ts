
"use server";

import {prisma} from "@/lib/prisma";
import { cleanSenderEmail } from "./mailParser";
import { simpleParser } from "mailparser";

// Manual parser for quoted-printable encoded content
function decodeQuotedPrintable(encoded: string): string {
  return encoded
    .replace(/=\r?\n/g, '') // Remove soft line breaks
    .replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

// Extract MIME parts from multipart email
function extractMimeParts(rawEmail: string): { html: string; text: string } {
  let html = '';
  let text = '';
  
  try {
    // Find the boundary
    const boundaryMatch = rawEmail.match(/boundary=([^\s;]+)/i);
    console.log('🔧 Manual parser - boundary match:', boundaryMatch);
    
    if (!boundaryMatch) {
      console.log('❌ No boundary found in email');
      return { html, text };
    }
    
    const boundary = boundaryMatch[1].replace(/['"]/g, '');
    console.log('🔧 Manual parser - boundary:', boundary);
    
    const parts = rawEmail.split(`--${boundary}`);
    console.log('🔧 Manual parser - found parts:', parts.length);
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      console.log(`🔧 Part ${i} has text/html:`, part.includes('Content-Type: text/html'));
      console.log(`🔧 Part ${i} has text/plain:`, part.includes('Content-Type: text/plain'));
      
      // Check if this is an HTML part
      if (part.includes('Content-Type: text/html')) {
        // Match everything after the double newline (blank line after headers)
        const contentMatch = part.match(/Content-Transfer-Encoding: quoted-printable[\r\n]+\s*\r?\n([\s\S]+)$/);
        console.log('🔧 HTML content match:', !!contentMatch);
        if (contentMatch) {
          html = decodeQuotedPrintable(contentMatch[1].trim());
          console.log('🔧 Decoded HTML length:', html.length);
        }
      }
      // Check if this is a text part
      else if (part.includes('Content-Type: text/plain')) {
        // Match everything after the double newline (blank line after headers)
        const contentMatch = part.match(/Content-Transfer-Encoding: quoted-printable[\r\n]+\s*\r?\n([\s\S]+)$/);
        console.log('🔧 Text content match:', !!contentMatch);
        if (contentMatch) {
          text = decodeQuotedPrintable(contentMatch[1].trim());
          console.log('🔧 Decoded text length:', text.length);
        }
      }
    }
  } catch (error) {
    console.error('❌ Manual parsing error:', error);
  }
  
  console.log('🔧 Manual parser result - html:', html.length, 'text:', text.length);
  return { html, text };
}

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

      // Parse emails on server side
      const output = await Promise.all(emails.map(async (email: PrismaEmail) => {
        console.log('📦 Database email:', {
          id: email.id,
          subject: email.subject,
          bodyLength: email.body?.length || 0,
          fullRawBody: email.body,
        });
        
        let htmlContent = '';
        let textContent = '';
        let parsedSubject = email.subject || '';
        
        try {
          // Try manual parsing first
          const manualParsed = extractMimeParts(email.body || '');
          
          if (manualParsed.html || manualParsed.text) {
            htmlContent = manualParsed.html;
            textContent = manualParsed.text;
            
            // Try to extract subject from email headers if not in DB
            if (!parsedSubject && email.body) {
              const subjectMatch = email.body.match(/^Subject:\s*(.+?)$/mi);
              if (subjectMatch) {
                parsedSubject = subjectMatch[1].trim();
              }
            }
            
            console.log('✅ Manual parsed email:', {
              id: email.id,
              hasHtml: !!htmlContent,
              hasText: !!textContent,
              htmlLength: htmlContent.length,
              textLength: textContent.length,
              subject: parsedSubject,
            });
          } else {
            // Fallback to mailparser
            const emailBuffer = Buffer.from(email.body || '', 'utf-8');
            const parsed = await simpleParser(emailBuffer);
            
            if (parsed.html && parsed.html !== false) {
              htmlContent = parsed.html.toString();
            } else if (parsed.textAsHtml) {
              htmlContent = parsed.textAsHtml;
            }
            
            textContent = parsed.text || '';
            parsedSubject = parsed.subject || email.subject || '';
            
            console.log('✅ Mailparser parsed email:', {
              id: email.id,
              hasHtml: !!htmlContent,
              hasText: !!textContent,
              htmlLength: htmlContent.length,
              textLength: textContent.length,
            });
          }
        } catch (error) {
          console.error('❌ Failed to parse email:', email.id, error);
          textContent = email.body || '';
        }
        
        return {
          id: email.id,
          date: email.created_at || new Date(),
          mail_from: cleanSenderEmail(email.sender) || "",
          rcpt_to: email.recipients,
          subject: parsedSubject,
          htmlContent,
          textContent,
          size: Number(email.size || 0),
        };
      }));
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


