const exhibitionData = require("../data/exhibitionData");

/**
 * GET /exhibitions
 * Query params:
 * - section: Partners | Exhibitors | Startup (defaults to Partners)
 * - userId: optional string to map onto each item as `userId`
 */
const getExhibitions = (req, res) => {
  try {
    const section = req.query.section || "Partners";
    const userId = req.query.userId || null;

    if (!exhibitionData[section]) {
      return res.status(400).json({ success: false, message: "Invalid section" });
    }

    // Clone items and attach userId if provided
    const items = exhibitionData[section].map((item) => ({ ...item, userId }));

    res.json({ success: true, section, items });
  } catch (error) {
    console.error("exhibitionController.getExhibitions error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getExhibitions,
};
