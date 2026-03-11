import { Inbox } from "lucide-react";

export function EmptyState({ message = "No results yet", sub = "Submit a query to get started" }: { message?: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Inbox className="h-12 w-12 text-muted-foreground/40 mb-3" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
      <p className="text-xs text-muted-foreground/60 mt-1">{sub}</p>
    </div>
  );
}
