import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeContract, type ContractAnalysisResponse } from "@/services/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { ResultCard } from "@/components/shared/ResultCard";
import { FileUpload } from "@/components/shared/FileUpload";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { NoticeBanner } from "@/components/shared/NoticeBanner";
import { StatusPill } from "@/components/shared/StatusPill";
import { UserHistoryPanel } from "@/components/shared/UserHistoryPanel";
import { ShieldCheck } from "lucide-react";

export default function ContractPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContractAnalysisResponse | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!file && !text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      if (file) fd.append("contract_file", file);
      if (text.trim()) fd.append("contract_text", text);
      const res = await analyzeContract(fd);
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <PageHeader title="Contract Analysis" description="Upload or paste a contract for AI-powered clause extraction and risk analysis." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
      <div className="space-y-4 mb-6">
        <FileUpload onFile={setFile} accept=".pdf,.doc,.docx,.txt" label="Upload contract document" />
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Or paste contract text here..." rows={4} />
        <Button onClick={handleSubmit} disabled={loading || (!file && !text.trim())}>
          <ShieldCheck className="h-4 w-4 mr-2" /> Analyze Contract
        </Button>
      </div>

      {loading && <LoadingState message="Analyzing contract..." />}
      {error && <NoticeBanner variant="error">{error}</NoticeBanner>}
      {!result && !loading && <EmptyState />}

      {result && (
        <div className="space-y-4 animate-fade-in">
          {result.final_summary && <ResultCard title="Contract Summary"><p className="text-sm whitespace-pre-wrap">{result.final_summary}</p></ResultCard>}
          <ResultCard title="Risk Overview">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <StatusPill
                label={`${result.risk_level} Risk`}
                variant={result.risk_level === "High" ? "error" : result.risk_level === "Moderate" ? "warning" : "success"}
              />
              <p className="font-medium">{result.risk_score}/100</p>
              {result.contract_type && <p className="text-muted-foreground">{result.contract_type}</p>}
            </div>
            {result.parties?.length > 0 && <p className="mt-3 text-sm text-muted-foreground">Parties: {result.parties.join(", ")}</p>}
          </ResultCard>
          {result.key_risks?.length > 0 && (
            <ResultCard title="Key Risks">
              <ul className="list-disc list-inside text-sm space-y-1">
                {result.key_risks.map((risk, index) => <li key={index}>{risk}</li>)}
              </ul>
            </ResultCard>
          )}
          {result.clauses && result.clauses.length > 0 && (
            <ResultCard title="Extracted Clauses">
              <div className="space-y-3">
                {result.clauses.map((c, i) => (
                  <div key={i} className="border rounded-md p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">{c.clause_name || `Clause ${i + 1}`}</p>
                      <StatusPill
                        label={c.risk_level}
                        variant={c.risk_level === "High" ? "error" : c.risk_level === "Medium" ? "warning" : "success"}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{c.summary}</p>
                    {c.issue && <p className="text-sm mt-2"><span className="font-medium">Issue:</span> {c.issue}</p>}
                    {c.suggestion && <p className="text-sm mt-2"><span className="font-medium">Suggestion:</span> {c.suggestion}</p>}
                    {c.improved_clause && <p className="text-sm mt-2 whitespace-pre-wrap"><span className="font-medium">Improved Clause:</span> {c.improved_clause}</p>}
                  </div>
                ))}
              </div>
            </ResultCard>
          )}
          {result.missing_clauses && result.missing_clauses.length > 0 && (
            <ResultCard title="Missing Clauses">
              <ul className="list-disc list-inside text-sm space-y-1">{result.missing_clauses.map((m: string, i: number) => <li key={i}>{m}</li>)}</ul>
            </ResultCard>
          )}
          {result.negotiation_insights?.length > 0 && (
            <ResultCard title="Negotiation Insights">
              <ul className="list-disc list-inside text-sm space-y-1">
                {result.negotiation_insights.map((insight, index) => <li key={index}>{insight}</li>)}
              </ul>
            </ResultCard>
          )}
        </div>
      )}
      </div>
      <div className="space-y-4">
        <UserHistoryPanel category="documents" title="Document History" />
      </div>
      </div>
    </div>
  );
}
