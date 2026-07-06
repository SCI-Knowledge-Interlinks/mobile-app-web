import { apiRequest } from "./apiClient";

export async function getFaqList() {
  const response = await apiRequest("/faq-list");
  const faqList = response.data?.faqList || [];

  return faqList.map(mapFaq);
}

function mapFaq(faq) {
  return {
    id: faq.id,
    question: faq.question || "",
    answer: faq.answer || "",
  };
}
