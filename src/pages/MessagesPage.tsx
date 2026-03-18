import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageCirclePlus, Search, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useInbox } from "@/lib/inbox-context";
import {
  listMessageUsers,
  type MessageParticipant,
} from "@/services/api";

function formatRole(role: string) {
  return role.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    activeConversationId,
    conversations,
    isBootstrapping,
    messagesByConversation,
    openConversation,
    sendMessage,
    setActiveConversationId,
    startConversationWithLawyerHandle,
    startConversationWithParticipant,
  } = useInbox();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [participants, setParticipants] = useState<MessageParticipant[]>([]);
  const [message, setMessage] = useState("");
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [sending, setSending] = useState(false);

  const requestedConversationId = Number(searchParams.get("conversation") || "");
  const selectedConversationId =
    Number.isFinite(requestedConversationId) && requestedConversationId > 0
      ? requestedConversationId
      : activeConversationId;
  const requestedLawyerHandle = searchParams.get("lawyer");

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
    if (!requestedLawyerHandle && !selectedConversationId) {
      setActiveConversationId(null);
      return;
    }

    let active = true;

    async function loadRequestedConversation() {
      try {
        setLoadingConversation(true);
        const detail = requestedLawyerHandle
          ? await startConversationWithLawyerHandle(requestedLawyerHandle)
          : await openConversation(selectedConversationId as number);
        if (!active) {
          return;
        }
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

    void loadRequestedConversation();
    return () => {
      active = false;
    };
  }, [
    openConversation,
    requestedLawyerHandle,
    selectedConversationId,
    setActiveConversationId,
    setSearchParams,
    startConversationWithLawyerHandle,
    toast,
  ]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  );

  const activeMessages = useMemo(
    () => (selectedConversationId ? messagesByConversation[selectedConversationId] ?? [] : []),
    [messagesByConversation, selectedConversationId],
  );

  async function handleOpenConversation(conversationId: number) {
    try {
      setLoadingConversation(true);
      const detail = await openConversation(conversationId);
      setSearchParams((params) => {
        params.set("conversation", String(detail.conversation.id));
        params.delete("lawyer");
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

  async function handleStartConversation(participantId: string) {
    try {
      setLoadingConversation(true);
      const detail = await startConversationWithParticipant(participantId);
      setSearchParams((params) => {
        params.set("conversation", String(detail.conversation.id));
        params.delete("lawyer");
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
    if (!selectedConversationId || !message.trim() || sending) {
      return;
    }
    try {
      setSending(true);
      await sendMessage(selectedConversationId, message.trim());
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
                <p className="mt-2 text-sm text-slate-500">
                  Conversations are cached per account, so your inbox reappears quickly after you sign back in.
                </p>
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
                    onClick={() => void handleStartConversation(participant.id)}
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
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Conversations</p>
                {isBootstrapping ? <span className="text-xs text-slate-400">Syncing...</span> : null}
              </div>
              <div className="space-y-3">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => void handleOpenConversation(conversation.id)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                      selectedConversationId === conversation.id
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`font-semibold ${selectedConversationId === conversation.id ? "text-white" : "text-slate-950"}`}>
                          {conversation.counterpart.full_name}
                        </p>
                        <p className={`mt-1 text-sm ${selectedConversationId === conversation.id ? "text-slate-300" : "text-slate-500"}`}>
                          {conversation.last_message_preview || "Conversation started"}
                        </p>
                      </div>
                      {conversation.unread_count > 0 ? (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          selectedConversationId === conversation.id
                            ? "bg-white/15 text-white"
                            : "bg-rose-500 text-white"
                        }`}>
                          {conversation.unread_count}
                        </span>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-[30px] border-slate-200 bg-white shadow-xl shadow-slate-200/40">
          <CardContent className="flex h-[78vh] flex-col p-0">
            <div className="border-b border-slate-200 px-6 py-5">
              {activeConversation ? (
                <>
                  <p className="font-display text-3xl font-bold text-slate-950">{activeConversation.counterpart.full_name}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatRole(activeConversation.counterpart.role)}</p>
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
                activeMessages.length > 0 ? activeMessages.map((item) => (
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
                  placeholder={`Write a message as ${user?.full_name || "your account"}...`}
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
                  disabled={!selectedConversationId || !message.trim() || sending}
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
