import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { predictStrength, type CaseStrengthResponse } from "@/services/api";
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
  const [result, setResult] = useState<CaseStrengthResponse | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await predictStrength({ case_description: input });
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
              {result.case_strength_score !== undefined && (
                <div className="text-center">
                  <div className="text-4xl font-display font-bold text-foreground">{result.case_strength_score}<span className="text-lg text-muted-foreground">/100</span></div>
                  <StatusPill label={result.strength_label} variant={getScoreVariant(result.case_strength_score)} />
                </div>
              )}
              <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${result.case_strength_score || 0}%`,
                    background: result.case_strength_score >= 70 ? "hsl(var(--success))" : result.case_strength_score >= 40 ? "hsl(var(--warning))" : "hsl(var(--destructive))",
                  }}
                />
              </div>
            </div>
          </ResultCard>
          {result.final_analysis && <ResultCard title="Final Analysis"><p className="text-sm whitespace-pre-wrap">{result.final_analysis}</p></ResultCard>}
          {result.key_strengths?.length > 0 && (
            <ResultCard title="Key Strengths">
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                {result.key_strengths.map((line, index) => <li key={index}>{line}</li>)}
              </ul>
            </ResultCard>
          )}
          {result.key_weaknesses?.length > 0 && (
            <ResultCard title="Key Weaknesses">
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                {result.key_weaknesses.map((line, index) => <li key={index}>{line}</li>)}
              </ul>
            </ResultCard>
          )}
          {result.missing_elements?.length > 0 && (
            <ResultCard title="Missing Elements">
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                {result.missing_elements.map((line, index) => <li key={index}>{line}</li>)}
              </ul>
            </ResultCard>
          )}
          {result.suggested_sections?.length > 0 && (
            <ResultCard title="Suggested Sections">
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                {result.suggested_sections.map((line, index) => <li key={index}>{line}</li>)}
              </ul>
            </ResultCard>
          )}
          {result.similar_cases?.length > 0 && (
            <ResultCard title="Similar Cases">
              <div className="space-y-3">
                {result.similar_cases.map((item, index) => (
                  <div key={`${item.case_title}-${index}`} className="rounded-lg border border-border/70 p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{item.case_title}</p>
                      {item.similarity_score && <span className="text-xs text-muted-foreground">{item.similarity_score}</span>}
                    </div>
                    <p className="mt-1 text-muted-foreground">{item.court}</p>
                    {item.relevance_reason && <p className="mt-2">{item.relevance_reason}</p>}
                    {item.source_link && <a className="mt-2 inline-block text-primary underline-offset-4 hover:underline" href={item.source_link} target="_blank" rel="noreferrer">Open source</a>}
                  </div>
                ))}
              </div>
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
