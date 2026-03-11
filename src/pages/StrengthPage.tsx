import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { predictStrength } from "@/services/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { ResultCard } from "@/components/shared/ResultCard";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { NoticeBanner } from "@/components/shared/NoticeBanner";
import { StatusPill } from "@/components/shared/StatusPill";
import { UserHistoryPanel } from "@/components/shared/UserHistoryPanel";
import { TrendingUp } from "lucide-react";

export default function StrengthPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const evidenceItems = /\b(screenshot|invoice|recording|photo|video|cctv|document|statement)\b/i.test(input) ? 2 : 0;
      const witnessCount = /\bwitness|saw|seen by\b/i.test(input) ? 1 : 0;
      const res = await predictStrength({
        evidence_items: evidenceItems,
        witness_count: witnessCount,
        documentary_support: /\b(document|invoice|statement|receipt)\b/i.test(input),
        police_complaint_filed: /\bfir|complaint filed|police complaint\b/i.test(input),
        incident_recency_days: /\byesterday|today|last night\b/i.test(input) ? 1 : 30,
        jurisdiction_match: true,
      });
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreVariant = (score: number): "success" | "warning" | "error" => {
    if (score >= 70) return "success";
    if (score >= 40) return "warning";
    return "error";
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <PageHeader title="Case Strength Prediction" description="Assess the strength of a legal case using AI analysis." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
      <div className="space-y-4 mb-6">
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Describe the case for strength prediction..." rows={5} />
        <Button onClick={handleSubmit} disabled={loading || !input.trim()}>
          <TrendingUp className="h-4 w-4 mr-2" /> Predict Strength
        </Button>
      </div>

      {loading && <LoadingState message="Evaluating case strength..." />}
      {error && <NoticeBanner variant="error">{error}</NoticeBanner>}
      {!result && !loading && <EmptyState />}

      {result && (
        <div className="space-y-4 animate-fade-in">
          <ResultCard title="Strength Assessment">
            <div className="flex items-center gap-4 mb-4">
              {result.score !== undefined && (
                <div className="text-center">
                  <div className="text-4xl font-display font-bold text-foreground">{result.score}<span className="text-lg text-muted-foreground">/100</span></div>
                  <StatusPill label={result.verdict || (result.score >= 70 ? "Strong" : result.score >= 40 ? "Moderate" : "Weak")} variant={getScoreVariant(result.score)} />
                </div>
              )}
              <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${result.score || 0}%`,
                    background: result.score >= 70 ? "hsl(var(--success))" : result.score >= 40 ? "hsl(var(--warning))" : "hsl(var(--destructive))",
                  }}
                />
              </div>
            </div>
          </ResultCard>
          {result.verdict && <ResultCard title="Verdict"><p className="text-sm font-medium">{result.verdict}</p></ResultCard>}
          {result.rationale && (
            <ResultCard title="Rationale">
              {Array.isArray(result.rationale) ? (
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  {result.rationale.map((line: string, index: number) => <li key={index}>{line}</li>)}
                </ul>
              ) : <p className="text-sm whitespace-pre-wrap text-muted-foreground">{result.rationale}</p>}
            </ResultCard>
          )}
        </div>
      )}
      </div>
      <div className="space-y-4">
        <UserHistoryPanel
          category="analysis"
          title="Strength History"
          onSelect={(item) => setInput(item.prompt_excerpt || item.title)}
        />
      </div>
      </div>
    </div>
  );
}
