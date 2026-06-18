import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';
import FaqsClient from './FaqsClient';

export interface AdminFaq {
  faqId: string;
  question: string;
  answer: string;
}

export default async function AdminFaqsPage() {
  const session = await getSession();
  if (!session?.isLoggedIn || !session?.isAdmin) redirect('/');

  try {
    const res = await dataverse.get<{ value: any[] }>(
      `bb_faqs?$filter=statecode eq 0&$select=bb_faqid,bb_question,bb_answerformatted`
    );

    const faqs: AdminFaq[] = (res.value ?? []).map((f: any) => ({
      faqId: f.bb_faqid,
      question: f.bb_question ?? '',
      answer: f.bb_answerformatted ?? '',
    }));

    return <FaqsClient faqs={faqs} />;
  } catch (err) {
    console.error('Admin FAQs fetch failed:', err);
    return <FaqsClient faqs={[]} />;
  }
}
