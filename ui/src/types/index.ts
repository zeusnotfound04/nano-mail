export interface Email {
    id: number;
    sender: string;
    recipients: string[]; 
    subject: string;
    body: string;
    size: number;
    created_at: Date;
  }
  