const { getSessionsList, getSpeakersList, getAttendeesList } = require("../data/sessionData");

function getSessions(req, res) {
  res.json({
    success: true,
    message: "Sessions list fetched successfully",
    data: {
      sessions: getSessionsList(),
    },
  });
}

function getSpeakers(req, res) {
  res.json({
    success: true,
    message: "Speakers list fetched successfully",
    data: {
      speakers: getSpeakersList(),
    },
  });
}

function getAttendees(req, res) {
  res.json({
    success: true,
    message: "Attendees list fetched successfully",
    data: {
      attendees: getAttendeesList(),
    },
  });
}

module.exports = {
  getSessions,
  getSpeakers,
  getAttendees,
};
