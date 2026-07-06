const { pool } = require("../config/database");

const mapEvent = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    bannerImage: row.banner_image,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    updatedAt: row.updated_at,
  };
};

const findAllEvents = async () => {
  const [rows] = await pool.execute(
    `SELECT *
     FROM events
     ORDER BY start_date DESC, id DESC`
  );

  return rows.map(mapEvent);
};

/**
 * Returns the event that is active now, or the nearest upcoming / latest event for the home screen.
 */
const findCurrentEvent = async () => {
  const [activeRows] = await pool.execute(
    `SELECT *
     FROM events
     WHERE start_date <= NOW() AND end_date >= NOW()
     ORDER BY start_date DESC, id DESC
     LIMIT 1`
  );

  if (activeRows[0]) {
    return mapEvent(activeRows[0]);
  }

  const [upcomingRows] = await pool.execute(
    `SELECT *
     FROM events
     WHERE start_date > NOW()
     ORDER BY start_date ASC, id DESC
     LIMIT 1`
  );

  if (upcomingRows[0]) {
    return mapEvent(upcomingRows[0]);
  }

  const [latestRows] = await pool.execute(
    `SELECT *
     FROM events
     ORDER BY start_date DESC, id DESC
     LIMIT 1`
  );

  return mapEvent(latestRows[0]);
};

const countEvents = async () => {
  const [rows] = await pool.execute("SELECT COUNT(*) AS total FROM events");
  return Number(rows[0]?.total || 0);
};

const seedDefaultEventIfEmpty = async () => {
  const total = await countEvents();
  if (total > 0) {
    return false;
  }

  await pool.execute(
    `INSERT INTO events (
      title,
      banner_image,
      description,
      start_date,
      end_date
    ) VALUES (?, ?, ?, ?, ?)`,
    [
      "Prawaas 5.0",
      "/uploads/events/prawaas-5-banner.jpg",
      "Prawaas 5.0 aims to bring stakeholders together to expand services, modernise infrastructure, and enable inclusive access through a truly multimodal approach integrating buses, metro, taxis, and last-mile solutions.",
      "2026-07-09 09:00:00",
      "2026-07-11 18:00:00",
    ]
  );

  return true;
};

module.exports = {
  findAllEvents,
  findCurrentEvent,
  countEvents,
  seedDefaultEventIfEmpty,
};
