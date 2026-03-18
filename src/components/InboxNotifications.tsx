import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInbox } from "@/lib/inbox-context";

function previewText(text?: string | null): string {
  if (!text) {
    return "New activity in your inbox";
  }
  return text.length > 72 ? `${text.slice(0, 69)}...` : text;
}

export function InboxNotifications() {
  const { notifications, unreadCount } = useInbox();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-9 w-9 rounded-full border-slate-200 bg-white hover:bg-slate-50"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[320px] rounded-2xl border-slate-200 p-2">
        <DropdownMenuLabel className="px-3 py-2 text-slate-950">Message notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          notifications.map((conversation) => (
            <DropdownMenuItem key={conversation.id} asChild className="rounded-xl px-3 py-3">
              <Link to={`/messages?conversation=${conversation.id}`} className="flex flex-col items-start gap-1">
                <span className="text-sm font-semibold text-slate-950">{conversation.counterpart.full_name}</span>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {conversation.unread_count} unread
                </span>
                <span className="text-sm leading-6 text-slate-600">
                  {previewText(conversation.last_message_preview)}
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="px-3 py-6 text-sm leading-6 text-slate-500">
            New messages will show up here the moment they arrive.
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
