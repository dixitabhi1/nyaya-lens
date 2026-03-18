import type { ConversationSummary, DirectMessage } from "@/services/api";

const INBOX_STORAGE_PREFIX = "nyayasetu_inbox_snapshot";

export type InboxSnapshot = {
  conversations: ConversationSummary[];
  messages_by_conversation: Record<string, DirectMessage[]>;
  updated_at: string;
};

function storageKey(userId: string): string {
  return `${INBOX_STORAGE_PREFIX}:${userId}`;
}

export function getStoredInboxSnapshot(userId: string): InboxSnapshot | null {
  const raw = localStorage.getItem(storageKey(userId));
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as InboxSnapshot;
  } catch {
    return null;
  }
}

export function persistInboxSnapshot(userId: string, snapshot: InboxSnapshot): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(snapshot));
}
