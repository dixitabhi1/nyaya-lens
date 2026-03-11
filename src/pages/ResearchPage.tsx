import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { searchResearch } from "@/services/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { ResultCard } from "@/components/shared/ResultCard";
import { CitationCard } from "@/components/shared/CitationCard";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { NoticeBanner } from "@/components/shared/NoticeBanner";
import { BookOpen } from "lucide-react";

export default function ResearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await searchResearch({ query });
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader title="Legal Research Engine" description="Search statutes, judgments, and legal precedents using semantic search." />

      <div className="space-y-4 mb-6">
        <Textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for legal topics, statutes, or case law..." rows={3} />
        <Button onClick={handleSubmit} disabled={loading || !query.trim()}>
          <BookOpen className="h-4 w-4 mr-2" /> Search
        </Button>
      </div>

      {loading && <LoadingState message="Searching legal databases..." />}
      {error && <NoticeBanner variant="error">{error}</NoticeBanner>}
      {!result && !loading && <EmptyState />}

      {result && (
        <div className="space-y-4 animate-fade-in">
          {result.summary && <ResultCard title="Research Summary"><p className="text-sm whitespace-pre-wrap">{result.summary}</p></ResultCard>}
          {result.results && result.results.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Retrieved Documents</h4>
              <div className="grid gap-3">{result.results.map((s: any, i: number) => <CitationCard key={i} source={s} />)}</div>
            </div>
          )}
          {result.sources && result.sources.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sources</h4>
              <div className="grid gap-2 sm:grid-cols-2">{result.sources.map((s: any, i: number) => <CitationCard key={i} source={s} />)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
