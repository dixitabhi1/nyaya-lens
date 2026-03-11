import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeCase } from "@/services/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { ResultCard } from "@/components/shared/ResultCard";
import { CitationCard } from "@/components/shared/CitationCard";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { NoticeBanner } from "@/components/shared/NoticeBanner";
import { UserHistoryPanel } from "@/components/shared/UserHistoryPanel";
import { Search } from "lucide-react";

export default function CaseAnalysisPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await analyzeCase({
        incident_description: input,
        location: "",
        incident_date: "",
        people_involved: [],
        evidence: [],
        language: "en",
      });
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <PageHeader title="Case Analysis Engine" description="Describe a case to get a comprehensive legal analysis." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
      <div className="space-y-4 mb-6">
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Describe the case facts in detail..." rows={5} />
        <Button onClick={handleSubmit} disabled={loading || !input.trim()}>
          <Search className="h-4 w-4 mr-2" /> Analyze Case
        </Button>
      </div>

      {loading && <LoadingState message="Analyzing case..." />}
      {error && <NoticeBanner variant="error">{error}</NoticeBanner>}
      {!result && !loading && <EmptyState />}

      {result && (
        <div className="space-y-4 animate-fade-in">
          {result.case_summary && <ResultCard title="Case Summary"><p className="text-sm whitespace-pre-wrap">{result.case_summary}</p></ResultCard>}
          {result.applicable_laws && (
            <ResultCard title="Applicable Laws">
              {Array.isArray(result.applicable_laws) ? (
                <ul className="list-disc list-inside text-sm space-y-1">{result.applicable_laws.map((l: string, i: number) => <li key={i}>{l}</li>)}</ul>
              ) : <p className="text-sm whitespace-pre-wrap">{result.applicable_laws}</p>}
            </ResultCard>
          )}
          {result.legal_reasoning && <ResultCard title="Legal Reasoning"><p className="text-sm whitespace-pre-wrap text-muted-foreground">{result.legal_reasoning}</p></ResultCard>}
          {result.possible_punishment && <ResultCard title="Possible Punishment"><p className="text-sm">{result.possible_punishment}</p></ResultCard>}
          {result.evidence_required && (
            <ResultCard title="Evidence Required">
              {Array.isArray(result.evidence_required) ? (
                <ul className="list-disc list-inside text-sm space-y-1">{result.evidence_required.map((e: string, i: number) => <li key={i}>{e}</li>)}</ul>
              ) : <p className="text-sm">{result.evidence_required}</p>}
            </ResultCard>
          )}
          {result.recommended_next_steps && (
            <ResultCard title="Next Steps">
              {Array.isArray(result.recommended_next_steps) ? (
                <ol className="list-decimal list-inside text-sm space-y-1">{result.recommended_next_steps.map((s: string, i: number) => <li key={i}>{s}</li>)}</ol>
              ) : <p className="text-sm">{result.recommended_next_steps}</p>}
            </ResultCard>
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
      <div className="space-y-4">
        <UserHistoryPanel
          category="analysis"
          title="Previous Analyses"
          onSelect={(item) => setInput(item.prompt_excerpt || item.title)}
        />
      </div>
      </div>
    </div>
  );
}
