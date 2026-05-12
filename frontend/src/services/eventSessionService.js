import { apiRequest } from "./apiClient";

export async function getSessionsList() {
  const response = await apiRequest("/sessions-list");
  const sessions = response.data?.sessions || [];

  return sessions.map(mapSession);
}

function mapSession(session) {
  const speakerDetails = (session.event_speakers || []).map((speaker) => ({
    id: speaker.id,
    name: speaker.name,
    role: speaker.role,
    company: speaker.company,
    speakerType: speaker.speaker_type,
    initials: speaker.initials,
    about: speaker.bio,
    expertise: speaker.expertise || [],
  }));

  return {
    ...session,
    speakerDetails,
    speakers: speakerDetails.map((speaker) => speaker.initials),
  };
}
