//@ts-ignore
import { Attachment, simpleParser } from "mailparser";

export interface EmailContent {
  subject: string;
  from: string;
  text: string;
  html: string;
  text_as_html: string;
  attachments: Attachment[];
  date: Date;
}

/**
 * Cleans a sender email address that might contain angle brackets or SIZE parameter
 * @param senderString The raw sender string
 * @returns Cleaned sender email address
 */


export async function parseEmail(data: string): Promise<EmailContent> {
  try {
    // Handle empty data
    if (!data) {
      return {
        subject: "",
        from: "",
        text: "",
        html: "",
        text_as_html: "",
        attachments: [],
        date: new Date(),
      };
    }

    // Try to parse with the mailparser library
    const parsed = await simpleParser(data);

    // Clean the sender information
    const cleanedFrom = cleanSenderEmail(parsed.from?.text || "");

    // Get the best possible text content
    const textContent = parsed.text || 
                       (parsed.html ? "HTML content available but no plain text" : "") || 
                       "";
    
    // Construct the email content object
    const emailContent = {
      subject: parsed.subject ?? "",
      from: cleanedFrom,
      text: textContent,
      html: parsed.html || "",
      text_as_html: parsed.textAsHtml ?? "",
      attachments: parsed.attachments ?? [],
      date: parsed.date ?? new Date(),
    };
    
    console.log("Successfully parsed email:", {
      subject: emailContent.subject,
      from: emailContent.from,
      textLength: emailContent.text.length,
      htmlLength: emailContent.html.length,
      attachmentsCount: emailContent.attachments.length
    });
    
    return emailContent;
  } catch (error) {
    console.error("Error parsing email", error);
    
    // Try a fallback simple parsing for plain emails
    try {
      console.log("Attempting fallback parsing");
      
      // Very basic fallback parser for simple emails
      const subject = data.match(/Subject:(.*?)(\r?\n|\r)/i)?.[1]?.trim() || "";
      const from = data.match(/From:(.*?)(\r?\n|\r)/i)?.[1]?.trim() || "";
      const cleanedFrom = cleanSenderEmail(from);
      
      // Extract body - very simplistic approach
      let text = "";
      const lines = data.split(/\r?\n/);
      let bodyStarted = false;
      
      for (const line of lines) {
        if (!bodyStarted) {
          if (line.trim() === "") {
            bodyStarted = true;
          }
          continue;
        }
        
        // Skip multipart boundaries
        if (line.startsWith("--")) continue;
        
        text += line + "\n";
      }
      
      console.log("Fallback parsing completed");
      
      return {
        subject,
        from: cleanedFrom,
        text,
        html: "",
        text_as_html: text.replace(/\n/g, "<br>"),
        attachments: [],
        date: new Date()
      };
    } catch (fallbackError) {
      console.error("Fallback parsing also failed", fallbackError);
      
      // Return empty content as last resort
      return {
        subject: "Failed to parse email",
        from: "",
        text: "This email could not be parsed correctly.",
        html: "",
        text_as_html: "This email could not be parsed correctly.",
        attachments: [],
        date: new Date()
      };
    }
  }
}