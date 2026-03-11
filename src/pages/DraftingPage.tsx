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
import { UserHistoryPanel } from "@/components/shared/UserHistoryPanel";
import { PenTool, Download } from "lucide-react";

export default function DraftingPage() {
  const [draftType, setDraftType] = useState("");
  const [facts, setFacts] = useState("");
  const [parties, setParties] = useState("");
  const [reliefSought, setReliefSought] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!facts.trim() || !draftType.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await draftDocument({
        draft_type: draftType,
        facts,
        parties: parties.split(",").map((p) => p.trim()).filter(Boolean),
        relief_sought: reliefSought,
        jurisdiction,
      });
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result?.content) return;
    const blob = new Blob([result.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${draftType || "legal-draft"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <PageHeader title="Legal Document Drafting" description="Generate professional legal documents using AI." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
      <div className="space-y-4 mb-6">
        <Input value={draftType} onChange={(e) => setDraftType(e.target.value)} placeholder="Draft type (e.g., Legal Notice, Rental Agreement)" />
        <Textarea value={facts} onChange={(e) => setFacts(e.target.value)} placeholder="Describe the facts of the case..." rows={4} />
        <Input value={parties} onChange={(e) => setParties(e.target.value)} placeholder="Parties (comma-separated, e.g., Author, Unauthorized user)" />
        <Input value={reliefSought} onChange={(e) => setReliefSought(e.target.value)} placeholder="Relief sought (e.g., Cease use and remove copied material)" />
        <Input value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} placeholder="Jurisdiction (e.g., Lucknow)" />
        <Button onClick={handleSubmit} disabled={loading || !facts.trim() || !draftType.trim()}>
          <PenTool className="h-4 w-4 mr-2" /> Generate Draft
        </Button>
      </div>

      {loading && <LoadingState message="Drafting document..." />}
      {error && <NoticeBanner variant="error">{error}</NoticeBanner>}
      {!result && !loading && <EmptyState />}

      {result && (
        <div className="space-y-4 animate-fade-in">
          <ResultCard title="Draft Preview">
            <pre className="text-sm whitespace-pre-wrap font-body leading-relaxed">{result.content}</pre>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" /> Download Draft
              </Button>
            </div>
          </ResultCard>
          {result.notes && (
            <ResultCard title="Review Notes">
              {Array.isArray(result.notes) ? (
                <ul className="list-disc list-inside text-sm space-y-1">{result.notes.map((n: string, i: number) => <li key={i}>{n}</li>)}</ul>
              ) : <p className="text-sm">{result.notes}</p>}
            </ResultCard>
          )}
        </div>
      )}
      </div>
      <div className="space-y-4">
        <UserHistoryPanel
          category="drafting"
          title="Previous Drafts"
          onSelect={(item) => setFacts(item.prompt_excerpt || "")}
        />
      </div>
      </div>
    </div>
  );
}
