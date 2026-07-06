const { getSessionsList, getSpeakersList, getAttendeesList } = require("../data/sessionData");

function attachUserIdToList(items, userId) {
  return items.map((item) => ({ ...item, userId: userId ?? null }));
}

function getSessions(req, res) {
  const userId = req.query.userId || null;

  res.json({
    success: true,
    message: "Sessions list fetched successfully",
    data: {
      sessions: attachUserIdToList(getSessionsList(), userId),
    },
  });
}

function getSpeakers(req, res) {
  const userId = req.query.userId || null;

  res.json({
    success: true,
    message: "Speakers list fetched successfully",
    data: {
      speakers: attachUserIdToList(getSpeakersList(), userId),
    },
  });
}

function getAttendees(req, res) {
  const userId = req.query.userId || null;

  res.json({
    success: true,
    message: "Attendees list fetched successfully",
    data: {
      attendees: attachUserIdToList(getAttendeesList(), userId),
    },
  });
}

module.exports = {
  getSessions,
  getSpeakers,
  getAttendees,
};
