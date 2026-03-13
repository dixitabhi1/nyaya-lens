import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageCirclePlus, Search, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";
import {
  createMessagesWebSocket,
  getConversation,
  listConversations,
  listMessageUsers,
  sendConversationMessage,
  startConversation,
  startConversationWithLawyer,
  type ConversationDetailResponse,
  type ConversationSummary,
  type DirectMessage,
  type MessageParticipant,
} from "@/services/api";

function formatRole(role: string) {
  return role.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function MessagesPage() {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [participants, setParticipants] = useState<MessageParticipant[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationDetailResponse | null>(null);
  const [message, setMessage] = useState("");
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const [conversationList, userDirectory] = await Promise.all([
          listConversations(),
          listMessageUsers(undefined, 12),
        ]);
        if (!active) {
          return;
        }
        setConversations(conversationList.conversations);
        setParticipants(userDirectory.users);
      } catch (err: any) {
        if (!active) {
          return;
        }
        toast({
          title: "Messages unavailable",
          description: err?.message || "Unable to load conversations right now.",
          variant: "destructive",
        });
      }
    }

    void bootstrap();
    return () => {
      active = false;
    };
  }, [toast]);

  useEffect(() => {
    let active = true;

    async function searchParticipants() {
      try {
        const result = await listMessageUsers(deferredQuery || undefined, 12);
        if (!active) {
          return;
        }
        setParticipants(result.users);
      } catch {
        if (!active) {
          return;
        }
        setParticipants([]);
      }
    }

    void searchParticipants();
    return () => {
      active = false;
    };
  }, [deferredQuery]);

  useEffect(() => {
    if (!token) {
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
        setConversations((prev) => {
          const existing = prev.find((item) => item.id === incoming.conversation_id);
          const counterpart = incoming.sender.id === user?.id ? incoming.recipient : incoming.sender;
          const nextSummary: ConversationSummary = {
            id: incoming.conversation_id,
            counterpart,
            last_message_preview: incoming.content,
            last_message_at: incoming.created_at,
            unread_count: incoming.sender.id === user?.id ? 0 : existing ? existing.unread_count + 1 : 1,
          };
          if (!existing) {
            return [nextSummary, ...prev];
          }
          return [nextSummary, ...prev.filter((item) => item.id !== incoming.conversation_id)];
        });
        setActiveConversation((prev) => {
          if (!prev || prev.conversation.id !== incoming.conversation_id) {
            return prev;
          }
          if (prev.messages.some((item) => item.id === incoming.id)) {
            return prev;
          }
          return {
            conversation: {
              ...prev.conversation,
              last_message_preview: incoming.content,
              last_message_at: incoming.created_at,
              unread_count: 0,
            },
            messages: [...prev.messages, incoming],
          };
        });
      } catch {
        // Ignore malformed websocket payloads and keep the inbox usable.
      }
    };
    return () => {
      socket.close();
    };
  }, [token, user?.id]);

  useEffect(() => {
    const conversationParam = searchParams.get("conversation");
    const lawyerParam = searchParams.get("lawyer");
    if (!conversationParam && !lawyerParam) {
      return;
    }

    let active = true;

    async function openRequestedConversation() {
      try {
        setLoadingConversation(true);
        const detail = lawyerParam
          ? await startConversationWithLawyer(lawyerParam)
          : await getConversation(Number(conversationParam));
        if (!active) {
          return;
        }
        setActiveConversation(detail);
        setConversations((prev) => {
          const withoutCurrent = prev.filter((item) => item.id !== detail.conversation.id);
          return [detail.conversation, ...withoutCurrent];
        });
        setSearchParams((params) => {
          params.set("conversation", String(detail.conversation.id));
          params.delete("lawyer");
          return params;
        });
      } catch (err: any) {
        if (!active) {
          return;
        }
        toast({
          title: "Unable to open chat",
          description: err?.message || "Please try again shortly.",
          variant: "destructive",
        });
      } finally {
        if (active) {
          setLoadingConversation(false);
        }
      }
    }

    void openRequestedConversation();
    return () => {
      active = false;
    };
  }, [searchParams, setSearchParams, toast]);

  const activeCounterpart = useMemo(
    () => activeConversation?.conversation.counterpart ?? null,
    [activeConversation],
  );

  async function openConversation(conversationId: number) {
    try {
      setLoadingConversation(true);
      const detail = await getConversation(conversationId);
      setActiveConversation(detail);
      setSearchParams((params) => {
        params.set("conversation", String(conversationId));
        return params;
      });
    } catch (err: any) {
      toast({
        title: "Unable to load conversation",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingConversation(false);
    }
  }

  async function startConversationWithParticipant(participantId: string) {
    try {
      setLoadingConversation(true);
      const detail = await startConversation(participantId);
      setActiveConversation(detail);
      setConversations((prev) => {
        const withoutCurrent = prev.filter((item) => item.id !== detail.conversation.id);
        return [detail.conversation, ...withoutCurrent];
      });
      setSearchParams((params) => {
        params.set("conversation", String(detail.conversation.id));
        return params;
      });
    } catch (err: any) {
      toast({
        title: "Unable to start conversation",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingConversation(false);
    }
  }

  async function handleSend() {
    if (!activeConversation || !message.trim() || sending) {
      return;
    }
    try {
      setSending(true);
      const sent = await sendConversationMessage(activeConversation.conversation.id, message.trim());
      setActiveConversation((prev) =>
        prev
          ? {
              conversation: {
                ...prev.conversation,
                last_message_preview: sent.content,
                last_message_at: sent.created_at,
                unread_count: 0,
              },
              messages: [...prev.messages, sent],
            }
          : prev,
      );
      setConversations((prev) => [
        {
          id: sent.conversation_id,
          counterpart: sent.recipient.id === user?.id ? sent.sender : sent.recipient,
          last_message_preview: sent.content,
          last_message_at: sent.created_at,
          unread_count: 0,
        },
        ...prev.filter((item) => item.id !== sent.conversation_id),
      ]);
      setMessage("");
    } catch (err: any) {
      toast({
        title: "Unable to send message",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card className="rounded-[28px] border-slate-200 bg-white shadow-lg shadow-slate-200/40">
            <CardContent className="space-y-4 p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Start a chat</p>
                <h1 className="mt-2 font-display text-3xl font-bold text-slate-950">Realtime legal messaging</h1>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search users, lawyers, or email"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-3">
                {participants.map((participant) => (
                  <button
                    key={participant.id}
                    type="button"
                    onClick={() => void startConversationWithParticipant(participant.id)}
                    className="flex w-full items-start justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white"
                  >
                    <div>
                      <p className="font-semibold text-slate-950">{participant.full_name}</p>
                      <p className="mt-1 text-sm text-slate-500">{formatRole(participant.role)}</p>
                      {participant.lawyer_handle ? (
                        <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500">@{participant.lawyer_handle}</p>
                      ) : null}
                    </div>
                    <MessageCirclePlus className="mt-1 h-4 w-4 text-slate-500" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-slate-200 bg-white shadow-lg shadow-slate-200/40">
            <CardContent className="space-y-4 p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Conversations</p>
              <div className="space-y-3">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => void openConversation(conversation.id)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                      activeConversation?.conversation.id === conversation.id
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <p className={`font-semibold ${activeConversation?.conversation.id === conversation.id ? "text-white" : "text-slate-950"}`}>
                      {conversation.counterpart.full_name}
                    </p>
                    <p className={`mt-1 text-sm ${activeConversation?.conversation.id === conversation.id ? "text-slate-300" : "text-slate-500"}`}>
                      {conversation.last_message_preview || "Conversation started"}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-[30px] border-slate-200 bg-white shadow-xl shadow-slate-200/40">
          <CardContent className="flex h-[78vh] flex-col p-0">
            <div className="border-b border-slate-200 px-6 py-5">
              {activeCounterpart ? (
                <>
                  <p className="font-display text-3xl font-bold text-slate-950">{activeCounterpart.full_name}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatRole(activeCounterpart.role)}</p>
                </>
              ) : (
                <>
                  <p className="font-display text-3xl font-bold text-slate-950">Select a conversation</p>
                  <p className="mt-1 text-sm text-slate-500">Choose an existing chat or start a new one from the left panel.</p>
                </>
              )}
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
              {loadingConversation ? (
                <p className="text-sm text-slate-500">Loading conversation...</p>
              ) : activeConversation ? (
                activeConversation.messages.length > 0 ? activeConversation.messages.map((item) => (
                  <div
                    key={item.id}
                    className={`max-w-[78%] rounded-[24px] px-4 py-3 text-sm leading-7 ${
                      item.is_mine
                        ? "ml-auto bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {item.content}
                  </div>
                )) : (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm leading-7 text-slate-600">
                    This conversation is ready. Send the first message to start a realtime thread.
                  </div>
                )
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm leading-7 text-slate-600">
                  NyayaSetu direct messages are live. Search for a citizen, police user, or lawyer to start a private conversation.
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 px-6 py-5">
              <div className="flex gap-3">
                <Textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Write a message..."
                  className="min-h-[56px] resize-none"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void handleSend();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={!activeConversation || !message.trim() || sending}
                  className="shrink-0 rounded-2xl bg-slate-950 px-5 text-amber-50 hover:bg-slate-900"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
