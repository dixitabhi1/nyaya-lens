import { useEffect, useState } from "react";
import { History, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultCard } from "@/components/shared/ResultCard";
import { NoticeBanner } from "@/components/shared/NoticeBanner";
import { EmptyState } from "@/components/shared/EmptyState";
import { getHistory } from "@/services/api";

type HistoryItem = {
  id: number;
  action: string;
  category: string;
  title: string;
  prompt_excerpt?: string | null;
  result_excerpt?: string | null;
  created_at: string;
};

type Props = {
  category: string;
  title: string;
  onSelect?: (item: HistoryItem) => void;
};

export function UserHistoryPanel({ category, title, onSelect }: Props) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getHistory(category, 8);
      setItems(data?.items || []);
    } catch (e: any) {
      const message = e?.message || "Unable to load history.";
      if (/api error 500|internal server error/i.test(message)) {
        setItems([]);
        setError("");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [category]);

  return (
    <ResultCard
      title={title}
      action={
        <Button variant="ghost" size="icon" onClick={() => void load()} disabled={loading}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      }
    >
      {error ? <NoticeBanner variant="error">{error}</NoticeBanner> : null}
      {!loading && !error && items.length === 0 ? (
        <EmptyState message={`No ${category} history yet`} sub="Your recent activity will appear here after you use this module." />
      ) : null}
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect?.(item)}
            className="w-full text-left border rounded-lg p-3 hover:bg-secondary/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-1">{item.title}</p>
                {item.prompt_excerpt ? (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.prompt_excerpt}</p>
                ) : null}
                {item.result_excerpt ? (
                  <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2">{item.result_excerpt}</p>
                ) : null}
              </div>
              <History className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              {new Date(item.created_at).toLocaleString()}
            </p>
          </button>
        ))}
      </div>
    </ResultCard>
  );
}
