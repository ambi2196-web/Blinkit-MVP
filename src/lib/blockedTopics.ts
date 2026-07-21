import blockedTopicsData from "@/data/blocked_topics.json";

interface BlockedTopic {
  id: string;
  keywords: string[];
  response: string;
}

const blockedTopics = blockedTopicsData as BlockedTopic[];

export function checkBlockedTopic(text: string): string | null {
  const q = text.toLowerCase();
  for (const topic of blockedTopics) {
    if (topic.keywords.some((k) => q.includes(k))) return topic.response;
  }
  return null;
}
