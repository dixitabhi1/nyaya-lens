import { Button } from "@/components/ui/button";
import { ResultCard } from "@/components/shared/ResultCard";
import { StatusPill } from "@/components/shared/StatusPill";
import { Download } from "lucide-react";

export default function FIRResult({ data }: { data: any }) {
  if (!data) return null;

  const extracted = data.extracted_data || data.complainant || null;
  const sections = data.sections || data.bns_sections || data.bns_prediction || [];
  const draftText = data.draft_text || data.draft || data.fir_draft || "";
  const completenessScore = data.completeness?.completeness_score ?? data.completeness_score;
  const missingFields = data.completeness?.missing_fields || [];
  const caseStrengthScore = data.case_strength_score;

  const handleDownload = () => {
    const text = draftText || JSON.stringify(data, null, 2);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FIR-${data.fir_id || "draft"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {data.fir_id && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">FIR ID:</span>
          <code className="bg-secondary px-2 py-0.5 rounded text-xs font-mono">{data.fir_id}</code>
        </div>
      )}

      {extracted && (
        <ResultCard title="Extracted Complaint Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {Object.entries(extracted).map(([k, v]) => {
              const value = Array.isArray(v) ? (v.length ? v.join(", ") : "Not provided") : (v || "Not provided");
              return (
                <div key={k}>
                  <span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}:</span>{" "}
                  <span className="whitespace-pre-wrap break-words">{String(value)}</span>
                </div>
              );
            })}
          </div>
        </ResultCard>
      )}

      {sections.length > 0 && (
        <ResultCard title="BNS Section Suggestions">
          {Array.isArray(sections) ? (
            <div className="flex flex-wrap gap-2">{sections.map((s: any, i: number) => (
              <StatusPill key={i} label={typeof s === "string" ? s : s.section || s.title || s.name} variant="default" />
            ))}</div>
          ) : <p className="text-sm">{String(sections)}</p>}
        </ResultCard>
      )}

      {data.legal_reasoning && <ResultCard title="Legal Reasoning"><p className="text-sm whitespace-pre-wrap text-muted-foreground">{data.legal_reasoning}</p></ResultCard>}
      {data.jurisdiction && (
        <ResultCard title="Jurisdiction">
          {typeof data.jurisdiction === "string" ? (
            <p className="text-sm">{data.jurisdiction}</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-sm">
              {data.jurisdiction.suggested_police_station && (
                <div><span className="text-muted-foreground">Police Station:</span> <span>{data.jurisdiction.suggested_police_station}</span></div>
              )}
              {data.jurisdiction.district && (
                <div><span className="text-muted-foreground">District:</span> <span>{data.jurisdiction.district}</span></div>
              )}
              {data.jurisdiction.state && (
                <div><span className="text-muted-foreground">State:</span> <span>{data.jurisdiction.state}</span></div>
              )}
              {data.jurisdiction.confidence !== undefined && (
                <div><span className="text-muted-foreground">Confidence:</span> <span>{Math.round(data.jurisdiction.confidence * 100)}%</span></div>
              )}
            </div>
          )}
        </ResultCard>
      )}

      {(completenessScore !== undefined || caseStrengthScore !== undefined) && (
        <div className="grid grid-cols-2 gap-4">
          {completenessScore !== undefined && (
            <ResultCard title="Completeness">
              <div className="text-3xl font-display font-bold">{completenessScore}<span className="text-sm text-muted-foreground">%</span></div>
              {missingFields.length > 0 && (
                <div className="mt-3 text-xs text-muted-foreground space-y-1">
                  {missingFields.map((field: string) => <p key={field}>Missing: {field}</p>)}
                </div>
              )}
            </ResultCard>
          )}
          {caseStrengthScore !== undefined && (
            <ResultCard title="Case Strength">
              <div className="text-3xl font-display font-bold">{caseStrengthScore}<span className="text-sm text-muted-foreground">%</span></div>
            </ResultCard>
          )}
        </div>
      )}

      {draftText && (
        <ResultCard title="FIR Draft">
          <pre className="text-sm whitespace-pre-wrap font-body leading-relaxed">{draftText}</pre>
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={handleDownload}><Download className="h-4 w-4 mr-2" /> Download</Button>
          </div>
        </ResultCard>
      )}
    </div>
  );
}
