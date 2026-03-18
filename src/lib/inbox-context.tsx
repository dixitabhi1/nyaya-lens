import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/lib/auth-context";
import { getStoredInboxSnapshot, persistInboxSnapshot } from "@/lib/inbox-storage";
import {
  createMessagesWebSocket,
  getConversation,
  listConversations,
  sendConversationMessage,
  startConversation,
  startConversationWithLawyer,
  type ConversationDetailResponse,
  type ConversationSummary,
  type DirectMessage,
} from "@/services/api";

type InboxContextValue = {
  conversations: ConversationSummary[];
  messagesByConversation: Record<number, DirectMessage[]>;
  unreadCount: number;
  notifications: ConversationSummary[];
  activeConversationId: number | null;
  isBootstrapping: boolean;
  setActiveConversationId: (conversationId: number | null) => void;
  openConversation: (conversationId: number) => Promise<ConversationDetailResponse>;
  startConversationWithParticipant: (participantId: string) => Promise<ConversationDetailResponse>;
  startConversationWithLawyerHandle: (handle: string) => Promise<ConversationDetailResponse>;
  refreshConversations: () => Promise<void>;
  sendMessage: (conversationId: number, content: string) => Promise<DirectMessage>;
};

const InboxContext = createContext<InboxContextValue | undefined>(undefined);

function normalizeMessagesMap(
  raw: Record<string, DirectMessage[]>,
): Record<number, DirectMessage[]> {
  return Object.fromEntries(
    Object.entries(raw).map(([conversationId, messages]) => [Number(conversationId), messages]),
  );
}

function mergeMessages(existing: DirectMessage[], incoming: DirectMessage[]): DirectMessage[] {
  const byId = new Map<number, DirectMessage>();
  for (const message of existing) {
    byId.set(message.id, message);
  }
  for (const message of incoming) {
    byId.set(message.id, message);
  }
  return Array.from(byId.values()).sort((left, right) => {
    if (left.created_at === right.created_at) {
      return left.id - right.id;
    }
    return left.created_at.localeCompare(right.created_at);
  });
}

function upsertConversation(
  conversations: ConversationSummary[],
  conversation: ConversationSummary,
): ConversationSummary[] {
  return [conversation, ...conversations.filter((item) => item.id !== conversation.id)];
}

export function InboxProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<number, DirectMessage[]>>({});
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    persistInboxSnapshot(user.id, {
      conversations,
      messages_by_conversation: Object.fromEntries(
        Object.entries(messagesByConversation).map(([conversationId, messages]) => [
          conversationId,
          messages,
        ]),
      ),
      updated_at: new Date().toISOString(),
    });
  }, [conversations, messagesByConversation, user?.id]);

  const refreshConversations = useCallback(async () => {
    if (!user?.id) {
      return;
    }
    const response = await listConversations();
    startTransition(() => {
      setConversations(response.conversations);
    });
  }, [user?.id]);

  const applyConversationDetail = useCallback((detail: ConversationDetailResponse): ConversationDetailResponse => {
    startTransition(() => {
      setConversations((current) => upsertConversation(current, detail.conversation));
      setMessagesByConversation((current) => ({
        ...current,
        [detail.conversation.id]: mergeMessages(current[detail.conversation.id] ?? [], detail.messages),
      }));
    });
    return detail;
  }, []);

  const openConversation = useCallback(async (conversationId: number): Promise<ConversationDetailResponse> => {
    const detail = await getConversation(conversationId);
    setActiveConversationId(conversationId);
    return applyConversationDetail(detail);
  }, [applyConversationDetail]);

  const startConversationWithParticipant = useCallback(async (participantId: string): Promise<ConversationDetailResponse> => {
    const detail = await startConversation(participantId);
    setActiveConversationId(detail.conversation.id);
    return applyConversationDetail(detail);
  }, [applyConversationDetail]);

  const startConversationWithLawyerHandle = useCallback(async (handle: string): Promise<ConversationDetailResponse> => {
    const detail = await startConversationWithLawyer(handle);
    setActiveConversationId(detail.conversation.id);
    return applyConversationDetail(detail);
  }, [applyConversationDetail]);

  const sendMessage = useCallback(async (conversationId: number, content: string): Promise<DirectMessage> => {
    const sent = await sendConversationMessage(conversationId, content);
    startTransition(() => {
      setMessagesByConversation((current) => ({
        ...current,
        [conversationId]: mergeMessages(current[conversationId] ?? [], [sent]),
      }));
      setConversations((current) => {
        const existing = current.find((item) => item.id === conversationId);
        const counterpart = sent.recipient.id === user?.id ? sent.sender : sent.recipient;
        return upsertConversation(current, {
          id: conversationId,
          counterpart,
          last_message_preview: sent.content,
          last_message_at: sent.created_at,
          unread_count: existing?.unread_count ?? 0,
        });
      });
    });
    return sent;
  }, [user?.id]);

  useEffect(() => {
    let active = true;

    if (!token || !user?.id) {
      setConversations([]);
      setMessagesByConversation({});
      setActiveConversationId(null);
      setIsBootstrapping(false);
      return undefined;
    }

    setIsBootstrapping(true);
    const snapshot = getStoredInboxSnapshot(user.id);
    if (snapshot) {
      setConversations(snapshot.conversations);
      setMessagesByConversation(normalizeMessagesMap(snapshot.messages_by_conversation));
      setIsBootstrapping(false);
    }

    void refreshConversations().finally(() => {
        if (active) {
          setIsBootstrapping(false);
        }
      });

    return () => {
      active = false;
    };
  }, [refreshConversations, token, user?.id]);

  useEffect(() => {
    if (!token || !user?.id) {
      return undefined;
    }

    const socket = createMessagesWebSocket(token);
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.type !== "message.new") {
          return;
        }
        const incoming = data.payload as DirectMessage;
        const isIncoming = incoming.sender.id !== user.id;
        startTransition(() => {
          setMessagesByConversation((current) => ({
            ...current,
            [incoming.conversation_id]: mergeMessages(current[incoming.conversation_id] ?? [], [incoming]),
          }));
          setConversations((current) => {
            const existing = current.find((item) => item.id === incoming.conversation_id);
            const counterpart = incoming.sender.id === user.id ? incoming.recipient : incoming.sender;
            const nextUnreadCount = isIncoming
              ? activeConversationId === incoming.conversation_id
                ? 0
                : (existing?.unread_count ?? 0) + 1
              : existing?.unread_count ?? 0;
            return upsertConversation(current, {
              id: incoming.conversation_id,
              counterpart,
              last_message_preview: incoming.content,
              last_message_at: incoming.created_at,
              unread_count: nextUnreadCount,
            });
          });
        });
      } catch {
        // Ignore malformed websocket payloads and keep the inbox usable.
      }
    };

    return () => {
      socket.close();
    };
  }, [activeConversationId, token, user?.id]);

  const unreadCount = useMemo(
    () => conversations.reduce((total, conversation) => total + conversation.unread_count, 0),
    [conversations],
  );

  const notifications = useMemo(
    () =>
      conversations
        .filter((conversation) => conversation.unread_count > 0)
        .sort((left, right) => (right.last_message_at || "").localeCompare(left.last_message_at || ""))
        .slice(0, 5),
    [conversations],
  );

  const value = useMemo<InboxContextValue>(
    () => ({
      conversations,
      messagesByConversation,
      unreadCount,
      notifications,
      activeConversationId,
      isBootstrapping,
      setActiveConversationId,
      openConversation,
      startConversationWithParticipant,
      startConversationWithLawyerHandle,
      refreshConversations,
      sendMessage,
    }),
    [
      activeConversationId,
      conversations,
      isBootstrapping,
      messagesByConversation,
      notifications,
      openConversation,
      refreshConversations,
      sendMessage,
      startConversationWithLawyerHandle,
      startConversationWithParticipant,
      unreadCount,
    ],
  );

  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}

export function useInbox() {
  const context = useContext(InboxContext);
  if (!context) {
    throw new Error("useInbox must be used within an InboxProvider");
  }
  return context;
}
