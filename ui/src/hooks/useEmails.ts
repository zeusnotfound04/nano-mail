import { useQuery } from '@tanstack/react-query';
import { searchEmails } from '@/actions/getEmails';

export interface Email {
  id: string;
  from: string;
  subject: string;
  content: string;
  htmlContent: string;
  timestamp: Date;
  read: boolean;
}

export function useEmails(username: string) {
  return useQuery({
    queryKey: ['emails', username],
    queryFn: async () => {
      if (!username) return [];
      
      const fetchedEmails = await searchEmails(username);
      
      return fetchedEmails.map((email) => ({
        id: String(email.id),
        from: email.mail_from || "",
        subject: email.data?.subject || email.subject || "",
        content: email.data?.text || "",
        htmlContent: email.data?.text_as_html || "",
        timestamp: new Date(email.date),
        read: false,
      }));
    },
    enabled: !!username,
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 30,
    refetchIntervalInBackground: false,
  });
}
