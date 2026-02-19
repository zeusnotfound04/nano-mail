export interface Email {
  id: number;
  date: Date;
  mail_from: string;
  rcpt_to: string[];
  subject: string;
  htmlContent: string;
  textContent: string;
  size: number;
  read?: boolean;
}

  