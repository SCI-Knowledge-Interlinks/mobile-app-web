const {
  findBadgeByRegId,
  findBadgeByUserId,
  linkBadgeToUser,
} = require("../models/badgeModel");

const REG_ID_PATTERN = /^PWS-[A-Z]{3}-\d{4}$/i;

function normalizeRegId(value) {
  return String(value || "").trim().toUpperCase();
}

function isValidRegId(regId) {
  return REG_ID_PATTERN.test(regId);
}

function buildBadgePayload(badge) {
  return {
    regId: badge.regId,
    fullName: badge.fullName,
    company: badge.company,
    designation: badge.designation,
    badgeCategory: badge.badgeCategory,
    qrPayload: badge.regId,
    layout: {
      showName: true,
      showCompany: Boolean(badge.company),
      showDesignation: Boolean(badge.designation),
      showQrCode: true,
      showRegId: true,
      nameStyle: "bold-uppercase",
      companyStyle: "bold-uppercase",
      regIdStyle: "bold-uppercase",
    },
  };
}

async function getBadgeByRegId(req, res) {
  try {
    const regId = normalizeRegId(req.params.regId);

    if (!isValidRegId(regId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration ID format",
      });
    }

    const badge = await findBadgeByRegId(regId);

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: "Badge registration not found",
      });
    }

    return res.json({
      success: true,
      message: "Badge details fetched successfully",
      data: {
        badge: buildBadgePayload(badge),
      },
    });
  } catch (error) {
    console.error("badgeController.getBadgeByRegId error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch badge details",
    });
  }
}

async function getBadgeForUser(req, res) {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const badge = await findBadgeByUserId(userId);

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: "No badge linked to this user",
      });
    }

    return res.json({
      success: true,
      message: "Linked badge fetched successfully",
      data: {
        badge: buildBadgePayload(badge),
      },
    });
  } catch (error) {
    console.error("badgeController.getBadgeForUser error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch linked badge",
    });
  }
}

async function linkBadge(req, res) {
  try {
    const regId = normalizeRegId(req.body?.regId);
    const userId = req.body?.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    if (!isValidRegId(regId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration ID format",
      });
    }

    const badge = await linkBadgeToUser({ regId, userId });

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: "Badge registration not found",
      });
    }

    return res.json({
      success: true,
      message: "Badge linked successfully",
      data: {
        badge: buildBadgePayload(badge),
      },
    });
  } catch (error) {
    console.error("badgeController.linkBadge error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to link badge",
    });
  }
}

module.exports = {
  getBadgeByRegId,
  getBadgeForUser,
  linkBadge,
};
