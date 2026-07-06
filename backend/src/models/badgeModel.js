const { pool } = require("../config/database");
const { getDefaultBadgeRegistrations } = require("../data/badgeData");

const mapBadge = (row) => {
  if (!row) {
    return null;
  }

  return {
    regId: row.reg_id,
    fullName: row.full_name,
    company: row.company || "",
    designation: row.designation || "",
    badgeCategory: row.badge_category || "",
    userId: row.user_id ?? null,
  };
};

const findBadgeByRegId = async (regId) => {
  const [rows] = await pool.execute(
    "SELECT * FROM badge_registrations WHERE reg_id = ? LIMIT 1",
    [regId]
  );

  return mapBadge(rows[0]);
};

const findBadgeByUserId = async (userId) => {
  const [rows] = await pool.execute(
    "SELECT * FROM badge_registrations WHERE user_id = ? LIMIT 1",
    [userId]
  );

  return mapBadge(rows[0]);
};

const linkBadgeToUser = async ({ regId, userId }) => {
  await pool.execute(
    `UPDATE badge_registrations
     SET user_id = NULL
     WHERE user_id = ? AND reg_id <> ?`,
    [userId, regId]
  );

  const [result] = await pool.execute(
    `UPDATE badge_registrations
     SET user_id = ?
     WHERE reg_id = ?`,
    [userId, regId]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return findBadgeByRegId(regId);
};

const seedDefaultBadgesIfEmpty = async () => {
  const [rows] = await pool.execute(
    "SELECT COUNT(*) AS total FROM badge_registrations"
  );
  const total = Number(rows[0]?.total || 0);

  if (total > 0) {
    return null;
  }

  const defaults = getDefaultBadgeRegistrations();

  for (const badge of defaults) {
    await pool.execute(
      `INSERT INTO badge_registrations (
        reg_id,
        full_name,
        company,
        designation,
        badge_category
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        badge.regId,
        badge.fullName,
        badge.company,
        badge.designation || null,
        badge.badgeCategory || null,
      ]
    );
  }

  return defaults;
};

module.exports = {
  findBadgeByRegId,
  findBadgeByUserId,
  linkBadgeToUser,
  seedDefaultBadgesIfEmpty,
};
