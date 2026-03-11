import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeContract } from "@/services/api";
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
  const [result, setResult] = useState<any>(null);
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
          {result.summary && <ResultCard title="Contract Summary"><p className="text-sm whitespace-pre-wrap">{result.summary}</p></ResultCard>}
          {result.clauses && result.clauses.length > 0 && (
            <ResultCard title="Extracted Clauses">
              <div className="space-y-3">
                {result.clauses.map((c: any, i: number) => (
                  <div key={i} className="border rounded-md p-3">
                    <p className="text-sm font-medium">{c.title || c.name || `Clause ${i + 1}`}</p>
                    <p className="text-xs text-muted-foreground mt-1">{c.text || c.content || JSON.stringify(c)}</p>
                  </div>
                ))}
              </div>
            </ResultCard>
          )}
          {result.risks && result.risks.length > 0 && (
            <ResultCard title="Risk Analysis">
              <div className="space-y-2">
                {result.risks.map((r: any, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <StatusPill label={r.severity || "Risk"} variant={r.severity === "high" ? "error" : "warning"} />
                    <p className="text-sm">{typeof r === "string" ? r : r.issue || r.description || r.text}</p>
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
