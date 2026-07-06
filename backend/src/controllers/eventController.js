const { findAllEvents, findCurrentEvent } = require("../models/eventModel");

const getEvents = async (req, res) => {
  try {
    const events = await findAllEvents();

    return res.json({
      success: true,
      message: "Events fetched successfully",
      data: {
        events,
      },
    });
  } catch (error) {
    console.error("eventController.getEvents error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
};

const getCurrentEvent = async (req, res) => {
  try {
    const event = await findCurrentEvent();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "No event found",
      });
    }

    return res.json({
      success: true,
      message: "Current event fetched successfully",
      data: {
        event,
      },
    });
  } catch (error) {
    console.error("eventController.getCurrentEvent error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch current event",
    });
  }
};

module.exports = {
  getEvents,
  getCurrentEvent,
};
