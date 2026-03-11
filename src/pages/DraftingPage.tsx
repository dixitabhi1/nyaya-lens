import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { draftDocument } from "@/services/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { ResultCard } from "@/components/shared/ResultCard";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { NoticeBanner } from "@/components/shared/NoticeBanner";
import { PenTool, Download } from "lucide-react";

export default function DraftingPage() {
  const [docType, setDocType] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!details.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await draftDocument({ document_type: docType, details });
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result?.draft) return;
    const blob = new Blob([result.draft], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docType || "legal-draft"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader title="Legal Document Drafting" description="Generate professional legal documents using AI." />

      <div className="space-y-4 mb-6">
        <Input value={docType} onChange={(e) => setDocType(e.target.value)} placeholder="Document type (e.g., Rental Agreement, Legal Notice)" />
        <Textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Provide details for the document..." rows={5} />
        <Button onClick={handleSubmit} disabled={loading || !details.trim()}>
          <PenTool className="h-4 w-4 mr-2" /> Generate Draft
        </Button>
      </div>

      {loading && <LoadingState message="Drafting document..." />}
      {error && <NoticeBanner variant="error">{error}</NoticeBanner>}
      {!result && !loading && <EmptyState />}

      {result && (
        <div className="space-y-4 animate-fade-in">
          <ResultCard title="Draft Preview">
            <pre className="text-sm whitespace-pre-wrap font-body leading-relaxed">{result.draft}</pre>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" /> Download Draft
              </Button>
            </div>
          </ResultCard>
          {result.review_notes && (
            <ResultCard title="Review Notes">
              {Array.isArray(result.review_notes) ? (
                <ul className="list-disc list-inside text-sm space-y-1">{result.review_notes.map((n: string, i: number) => <li key={i}>{n}</li>)}</ul>
              ) : <p className="text-sm">{result.review_notes}</p>}
            </ResultCard>
          )}
        </div>
      )}
    </div>
  );
}
