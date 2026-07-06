import { apiRequest } from "./apiClient";

export async function getAttendeesList() {
  const response = await apiRequest("/attendees-list");
  const attendees = response.data?.attendees || [];

  return attendees.map(mapAttendee);
}

function mapAttendee(attendee) {
  return {
    id: attendee.id,
    name: attendee.name,
    role: attendee.role,
    company: attendee.company,
    initials: attendee.initials,
    about: attendee.bio,
    expertise: attendee.expertise || [],
    sessions: attendee.sessions || [],
  };
}
