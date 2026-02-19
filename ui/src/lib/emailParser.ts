import { simpleParser } from 'mailparser-mit';

export interface ParsedEmail {
  subject: string;
  from: string;
  to: string[];
  date: Date;
  htmlContent: string;
  textContent: string;
}

export async function parseEmail(rawEmail: string): Promise<ParsedEmail> {
  console.log('🔍 RAW EMAIL BODY:', {
    length: rawEmail.length,
    first500chars: rawEmail.substring(0, 500),
    hasContent: !!rawEmail,
  });
  
  try {
    // Use mailparser-mit which handles all MIME formats properly
    const parsed = await simpleParser(rawEmail);
    
    console.log('📧 Full parsed email object:', parsed);
    console.log('✅ Email parsed successfully:', {
      subject: parsed.subject,
      from: parsed.from?.text,
      hasHtml: !!parsed.html,
      hasText: !!parsed.text,
      htmlLength: parsed.html?.toString().length || 0,
      textLength: parsed.text?.length || 0,
    });
    
    return {
      subject: parsed.subject || '',
      from: parsed.from?.text || '',
      to: parsed.to?.value?.map(t => t.address || '') || [],
      date: parsed.date || new Date(),
      htmlContent: parsed.html?.toString() || '',
      textContent: parsed.text || '',
    };
  } catch (error) {
    console.error('❌ Failed to parse email:', error);
    
    // Fallback: try to extract basic info from headers
    const subjectMatch = rawEmail.match(/^Subject:\s*(.+)$/m);
    const fromMatch = rawEmail.match(/^From:\s*(.+)$/m);
    const dateMatch = rawEmail.match(/^Date:\s*(.+)$/m);
    
    return {
      subject: subjectMatch?.[1] || 'No Subject',
      from: fromMatch?.[1] || 'Unknown',
      to: [],
      date: dateMatch?.[1] ? new Date(dateMatch[1]) : new Date(),
      htmlContent: '',
      textContent: rawEmail,
    };
  }
}
