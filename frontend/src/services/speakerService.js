import { apiRequest } from "./apiClient";

export async function getSpeakersList() {
  const response = await apiRequest("/speakers-list");
  const speakers = response.data?.speakers || [];

  return speakers.map(mapSpeaker);
}

function mapSpeaker(speaker) {
  return {
    id: speaker.id,
    name: speaker.name,
    role: speaker.role,
    company: speaker.company,
    speakerType: speaker.speaker_type,
    initials: speaker.initials,
    about: speaker.bio,
    expertise: speaker.expertise || [],
    sessions: speaker.sessions || [],
  };
}
