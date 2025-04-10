
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

export async function parseEmail(data: string): Promise<EmailContent> {
  try {
    const parsed = await simpleParser(data);

    return {
      subject: parsed.subject ?? "",
      from: parsed.from?.text ?? "",
      text: parsed.text ?? "",
      html: parsed.html || "",
      text_as_html: parsed.textAsHtml ?? "",
      attachments: parsed.attachments ?? [],
      date: parsed.date ?? new Date(),
    };
  } catch (error) {
    console.error("Error parsing email", error);
    throw error;
  }
}