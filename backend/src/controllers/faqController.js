const { getFaqList } = require("../data/faqData");

function getFaqs(req, res) {
  res.json({
    success: true,
    message: "FAQ list fetched successfully",
    data: {
      faqList: getFaqList(),
    },
  });
}

module.exports = {
  getFaqs,
};
