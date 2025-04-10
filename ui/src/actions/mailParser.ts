
export function cleanSenderEmail(senderString: string | null): string {
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

  return senderString.trim();
}