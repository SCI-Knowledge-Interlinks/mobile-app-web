const faqList = [
  {
    id: "faq-profile",
    question: "How do I update my profile?",
    answer:
      "Go to the Profile tab and tap Edit Profile to update your bio, contact details and profile picture.",
  },
  {
    id: "faq-calendar",
    question: "What is My Calendar?",
    answer:
      "My Calendar shows sessions and meetings you have saved for quick access during the event.",
  },
  {
    id: "faq-networking",
    question: "How does networking or matchmaking work?",
    answer:
      "Use Networking to discover attendees and connect with people relevant to your interests.",
  },
  {
    id: "faq-meetings",
    question: "How do I book or manage meetings?",
    answer:
      "Open a profile and use the schedule option to request or manage a one-to-one meeting.",
  },
  {
    id: "faq-exhibition",
    question: "Where can I find exhibitor details and booth locations?",
    answer:
      "Open Exhibition to view exhibitors, booth numbers, halls and saved bookmarks.",
  },
  {
    id: "faq-search",
    question: "Can I search for speakers or sessions?",
    answer: "Yes. Use the search bar on Speakers, Sessions, Exhibition and Helpdesk pages.",
  },
  {
    id: "faq-support",
    question: "Who can I contact for technical issues?",
    answer:
      "Contact the technical desk from the Contact Us tab or send a support chat message.",
  },
];

function getFaqList() {
  return faqList;
}

module.exports = {
  getFaqList,
};
