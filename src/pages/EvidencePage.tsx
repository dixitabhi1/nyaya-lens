import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeEvidence } from "@/services/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { ResultCard } from "@/components/shared/ResultCard";
import { FileUpload } from "@/components/shared/FileUpload";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { NoticeBanner } from "@/components/shared/NoticeBanner";
import { UserHistoryPanel } from "@/components/shared/UserHistoryPanel";
import { Microscope } from "lucide-react";

export default function EvidencePage() {
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
      if (file) fd.append("evidence_file", file);
      if (text.trim()) fd.append("evidence_text", text);
      const res = await analyzeEvidence(fd);
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <PageHeader title="Evidence Analyzer" description="Upload or paste evidence for entity extraction, timeline, and investigation insights." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
      <div className="space-y-4 mb-6">
        <FileUpload onFile={setFile} label="Upload evidence file" />
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Or paste evidence text here..." rows={4} />
        <Button onClick={handleSubmit} disabled={loading || (!file && !text.trim())}>
          <Microscope className="h-4 w-4 mr-2" /> Analyze Evidence
        </Button>
      </div>

      {loading && <LoadingState message="Analyzing evidence..." />}
      {error && <NoticeBanner variant="error">{error}</NoticeBanner>}
      {!result && !loading && <EmptyState />}

      {result && (
        <div className="space-y-4 animate-fade-in">
          {result.extracted_text && <ResultCard title="Extracted Text"><p className="text-sm whitespace-pre-wrap">{result.extracted_text}</p></ResultCard>}
          {result.entities && result.entities.length > 0 && (
            <ResultCard title="Detected Entities">
              <div className="flex flex-wrap gap-2">
                {result.entities.map((e: any, i: number) => (
                  <span key={i} className="inline-flex items-center px-3 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                    {typeof e === "string" ? e : `${e.label || e.type}: ${e.value || e.name}`}
                  </span>
                ))}
              </div>
            </ResultCard>
          )}
          {result.timeline && result.timeline.length > 0 && (
            <ResultCard title="Timeline">
              <div className="space-y-3 border-l-2 border-accent/30 pl-4">
                {result.timeline.map((t: any, i: number) => (
                  <div key={i}>
                    <p className="text-xs font-semibold text-accent">{typeof t === "string" ? `Event ${i + 1}` : t.date || t.time || `Event ${i + 1}`}</p>
                    <p className="text-sm text-muted-foreground">{typeof t === "string" ? t : t.description || t.event || ""}</p>
                  </div>
                ))}
              </div>
            </ResultCard>
          )}
          {result.observations && (
            <ResultCard title="Investigation Observations">
              {Array.isArray(result.observations) ? (
                <ul className="list-disc list-inside text-sm space-y-1">{result.observations.map((o: string, i: number) => <li key={i}>{o}</li>)}</ul>
              ) : <p className="text-sm whitespace-pre-wrap">{result.observations}</p>}
            </ResultCard>
          )}
        </div>
      )}
      </div>
      <div className="space-y-4">
        <UserHistoryPanel category="documents" title="Evidence History" />
      </div>
      </div>
    </div>
  );
}
