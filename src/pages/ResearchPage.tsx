import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { searchResearch, type ResearchResponse } from "@/services/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { ResultCard } from "@/components/shared/ResultCard";
import { CitationCard } from "@/components/shared/CitationCard";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { NoticeBanner } from "@/components/shared/NoticeBanner";
import { UserHistoryPanel } from "@/components/shared/UserHistoryPanel";
import { BookOpen } from "lucide-react";

export default function ResearchPage() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"case_search" | "fir_analysis">("case_search");
  const [userRole, setUserRole] = useState<"basic" | "premium">("basic");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResponse | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await searchResearch({ user_query: query, mode, user_role: userRole });
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <PageHeader title="Legal Research Engine" description="Search statutes, judgments, and legal precedents using semantic search." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
      <div className="space-y-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <Button variant={mode === "case_search" ? "default" : "outline"} onClick={() => setMode("case_search")}>
            Case Search
          </Button>
          <Button variant={mode === "fir_analysis" ? "default" : "outline"} onClick={() => setMode("fir_analysis")}>
            FIR Intelligence
          </Button>
          <Button variant={userRole === "basic" ? "default" : "outline"} onClick={() => setUserRole("basic")}>
            Basic
          </Button>
          <Button variant={userRole === "premium" ? "default" : "outline"} onClick={() => setUserRole("premium")}>
            Premium
          </Button>
        </div>
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
          {result.message && <NoticeBanner variant="info">{result.message}</NoticeBanner>}
          {result.mode === "fir_analysis" && (
            <ResultCard title="FIR Intelligence">
              <div className="space-y-3 text-sm">
                {result.fir_analysis.improved_draft && (
                  <div>
                    <p className="font-medium">Improved FIR Draft</p>
                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{result.fir_analysis.improved_draft}</p>
                  </div>
                )}
                {result.fir_analysis.suggested_sections && (
                  <div>
                    <p className="font-medium">Suggested Sections</p>
                    <p className="mt-1 text-muted-foreground">{result.fir_analysis.suggested_sections}</p>
                  </div>
                )}
                {result.fir_analysis.risk_analysis && (
                  <div>
                    <p className="font-medium">Risk Analysis</p>
                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{result.fir_analysis.risk_analysis}</p>
                  </div>
                )}
              </div>
            </ResultCard>
          )}
          {result.mode === "case_search" && result.results.length > 0 && (
            <ResultCard title="Similar Cases">
              <div className="space-y-3">
                {result.results.map((item, index) => (
                  <div key={`${item.case_title}-${index}`} className="rounded-lg border border-border/70 p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{item.case_title}</p>
                      <span className="text-xs text-muted-foreground">{item.similarity_score}</span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{item.court}</p>
                    <p className="mt-2"><span className="font-medium">Charges:</span> {item.charges}</p>
                    <p className="mt-2"><span className="font-medium">Verdict:</span> {item.verdict}</p>
                    <p className="mt-2 text-muted-foreground">{item.comparison_reasoning}</p>
                    <a className="mt-2 inline-block text-primary underline-offset-4 hover:underline" href={item.source_link} target="_blank" rel="noreferrer">
                      Open source
                    </a>
                  </div>
                ))}
              </div>
            </ResultCard>
          )}
          {result.hits && result.hits.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Grounding Sources</h4>
              <div className="grid gap-2 sm:grid-cols-2">{result.hits.map((s, i) => <CitationCard key={i} source={s} />)}</div>
            </div>
          )}
        </div>
      )}
      </div>
      <div className="space-y-4">
        <UserHistoryPanel
          category="research"
          title="Previous Research"
          onSelect={(item) => setQuery(item.prompt_excerpt || item.title)}
        />
      </div>
      </div>
    </div>
  );
}
