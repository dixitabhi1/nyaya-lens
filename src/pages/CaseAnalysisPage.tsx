import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeCase, type CaseAnalysisResponse } from "@/services/api";
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
  const [result, setResult] = useState<CaseAnalysisResponse | null>(null);
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
          {result.final_analysis && <ResultCard title="Final Analysis"><p className="text-sm whitespace-pre-wrap">{result.final_analysis}</p></ResultCard>}
          {(result.case_summary || result.case_type) && (
            <ResultCard title="Case Overview">
              <div className="space-y-2 text-sm">
                {result.case_summary && <p className="whitespace-pre-wrap">{result.case_summary}</p>}
                {result.case_type && <p><span className="font-medium">Case Type:</span> {result.case_type}</p>}
                {result.parties?.length > 0 && <p><span className="font-medium">Parties:</span> {result.parties.join(", ")}</p>}
              </div>
            </ResultCard>
          )}
          {result.key_facts?.length > 0 && (
            <ResultCard title="Key Facts">
              <ul className="list-disc list-inside text-sm space-y-1">
                {result.key_facts.map((fact, index) => <li key={index}>{fact}</li>)}
              </ul>
            </ResultCard>
          )}
          {result.legal_issues?.length > 0 && (
            <ResultCard title="Legal Issues">
              <ul className="list-disc list-inside text-sm space-y-1">
                {result.legal_issues.map((issue, index) => <li key={index}>{issue}</li>)}
              </ul>
            </ResultCard>
          )}
          {result.legal_sections && (
            <ResultCard title="Applicable Laws">
              <ul className="list-disc list-inside text-sm space-y-1">
                {(result.legal_sections.length > 0 ? result.legal_sections : result.applicable_laws).map((law, i) => <li key={i}>{law}</li>)}
              </ul>
            </ResultCard>
          )}
          {result.strengths?.length > 0 && (
            <ResultCard title="Strengths">
              <ul className="list-disc list-inside text-sm space-y-1">
                {result.strengths.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </ResultCard>
          )}
          {result.weaknesses?.length > 0 && (
            <ResultCard title="Risks and Weaknesses">
              <ul className="list-disc list-inside text-sm space-y-1">
                {result.weaknesses.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </ResultCard>
          )}
          {result.missing_elements?.length > 0 && (
            <ResultCard title="Missing Elements">
              <ul className="list-disc list-inside text-sm space-y-1">
                {result.missing_elements.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </ResultCard>
          )}
          {result.legal_reasoning && <ResultCard title="Legal Reasoning"><p className="text-sm whitespace-pre-wrap text-muted-foreground">{result.legal_reasoning}</p></ResultCard>}
          {result.possible_punishment && <ResultCard title="Possible Punishment"><p className="text-sm">{result.possible_punishment}</p></ResultCard>}
          {result.evidence_required?.length > 0 && (
            <ResultCard title="Evidence Required">
              <ul className="list-disc list-inside text-sm space-y-1">{result.evidence_required.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </ResultCard>
          )}
          {result.possible_outcomes?.length > 0 && (
            <ResultCard title="Possible Outcomes">
              <ul className="list-disc list-inside text-sm space-y-1">
                {result.possible_outcomes.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </ResultCard>
          )}
          {(result.suggested_actions?.length > 0 || result.recommended_next_steps?.length > 0) && (
            <ResultCard title="Next Steps">
              <ol className="list-decimal list-inside text-sm space-y-1">
                {(result.suggested_actions.length > 0 ? result.suggested_actions : result.recommended_next_steps).map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </ResultCard>
          )}
          {result.similar_cases?.length > 0 && (
            <ResultCard title="Similar Cases">
              <div className="space-y-3">
                {result.similar_cases.map((item, index) => (
                  <div key={`${item.case_title}-${index}`} className="rounded-lg border border-border/70 p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{item.case_title}</p>
                      {item.similarity_score && <span className="text-xs text-muted-foreground">{item.similarity_score}</span>}
                    </div>
                    <p className="mt-1 text-muted-foreground">{item.court}</p>
                    {item.relevance && <p className="mt-2">{item.relevance}</p>}
                    {item.comparison_reasoning && <p className="mt-2 text-muted-foreground">{item.comparison_reasoning}</p>}
                    {item.source_link && <a className="mt-2 inline-block text-primary underline-offset-4 hover:underline" href={item.source_link} target="_blank" rel="noreferrer">Open source</a>}
                  </div>
                ))}
              </div>
            </ResultCard>
          )}
          {result.sources && result.sources.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sources</h4>
              <div className="grid gap-2 sm:grid-cols-2">{result.sources.map((s, i) => <CitationCard key={i} source={s} />)}</div>
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
