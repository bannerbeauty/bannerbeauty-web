import { dataverse } from '@/lib/dataverse';
import FAQClient from './FAQClient';

const FAQS = [
  {
    question: 'What is a Banner Bump?',
    answer: 'A Banner Bump is a neighborly gesture — a way to help a fellow patriot whose American flag has seen better days. When you spot a worn or tattered flag in your neighborhood, Banner Beauty lets you send that neighbor a heartfelt letter, a gift certificate for a new flag, or a brand new flag delivered right to their door. It\'s one American looking out for another.',
  },
  {
    question: 'How do I do a Banner Bump?',
    answer: 'Just click "Banner Bump a Fellow Patriot" from our home page. You\'ll walk through a simple process: tell us a little about yourself, provide your neighbor\'s address, choose how you\'d like to help (letter, gift certificate, or flag), personalize your message, and complete your order. The whole thing takes about five minutes.',
  },
  {
    question: 'Will my neighbor actually receive a letter in the mail?',
    answer: 'Yes — every Banner Bump includes a physical letter printed on quality paper and mailed via USPS First Class Mail to your neighbor\'s address. If you added a gift certificate or flag to your Banner Bump, those are fulfilled separately and delivered to the same address.',
  },
  {
    question: 'Do I have to share my contact information if I Banner Bump a neighbor?',
    answer: 'Not at all. You choose exactly what to share. You can send your Banner Bump completely anonymously, signed simply as "A Patriotic Neighbor." Or you can share your name, address, phone number, and email — whatever you\'re comfortable with. It\'s entirely up to you.',
  },
  {
    question: 'Can I send a Banner Bump anywhere?',
    answer: 'Banner Beauty serves the entire United States — all 50 states plus Washington D.C. We do not currently ship outside the U.S.',
  },
  {
    question: "What if I don't know my neighbor's name? Can I still do a Banner Bump?",
    answer: 'Absolutely. If you don\'t know your neighbor\'s name, the letter will be addressed to "Patriotic Neighbor." It still arrives looking warm and personal, and your neighbor will know someone in their community cares.',
  },
  {
    question: 'Do gift certificates expire?',
    answer: 'No — Banner Beauty gift certificates never expire. Your neighbor can redeem them whenever they\'re ready, whether that\'s tomorrow or two years from now.',
  },
  {
    question: 'How are gift certificates delivered if I buy them in the store?',
    answer: 'When you purchase a gift certificate in the Banner Beauty store, you\'ll receive a separate email for each certificate with your unique redemption code. You can use the code yourself on a future Banner Bump or store purchase, or forward the email to someone as a gift.',
  },
  {
    question: 'How do I contact support?',
    answer: 'You can reach us anytime at support@bannerbeauty.com. We typically respond within one business day. You can also visit our Support Center at bannerbeauty.com/support.',
  },
  {
    question: 'Are Banner Beauty flags and other products made in America?',
    answer: 'Yes. Always. Every flag and product sold in the Banner Beauty store is proudly made in the United States. We believe in supporting American workers and American craftsmanship — full stop.',
  },
];

export default async function FAQPage() {
  let faqs: { question: string; answer: string }[] = [];
  try {
    const res = await dataverse.get<{ value: any[] }>(
      `bb_faqs?$filter=statecode eq 0&$select=bb_question,bb_answerformatted`
    );
    faqs = (res.value ?? []).map((f: any) => ({
      question: f.bb_question ?? '',
      answer: f.bb_answerformatted ?? '',
    }));
  } catch (err) {
    console.error('FAQ fetch failed:', err);
    faqs = FAQS;
  }

  if (faqs.length === 0) faqs = FAQS;

  return <FAQClient faqs={faqs} />;
}
