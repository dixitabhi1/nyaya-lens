import { ExternalLink, BookOpen } from "lucide-react";

interface Source {
  title?: string;
  source?: string;
  url?: string;
  source_url?: string;
  citation?: string;
  excerpt?: string;
  [key: string]: any;
}

export function CitationCard({ source }: { source: Source }) {
  const title = source.title || source.source || "Source";
  const targetUrl = source.url || source.source_url;
  return (
    <div className="border rounded-lg p-3 bg-card card-elevated animate-fade-in">
      <div className="flex items-start gap-2">
        <BookOpen className="h-4 w-4 text-accent mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm text-foreground truncate">{title}</p>
            {targetUrl && (
              <a href={targetUrl} target="_blank" rel="noopener noreferrer" className="text-info hover:text-info/80">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          {source.citation && (
            <p className="text-[11px] text-muted-foreground mt-1 truncate">{source.citation}</p>
          )}
          {source.excerpt && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{source.excerpt}</p>
          )}
        </div>
      </div>
    </div>
  );
}
