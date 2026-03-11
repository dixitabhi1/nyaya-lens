import { Button } from "@/components/ui/button";
import { ResultCard } from "@/components/shared/ResultCard";
import { StatusPill } from "@/components/shared/StatusPill";
import { Download } from "lucide-react";

export default function FIRResult({ data }: { data: any }) {
  if (!data) return null;

  const handleDownload = () => {
    const text = data.draft || data.fir_draft || JSON.stringify(data, null, 2);
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

      {data.complainant && (
        <ResultCard title="Complainant Details">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(data.complainant).map(([k, v]) => (
              <div key={k}><span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}:</span> <span>{String(v)}</span></div>
            ))}
          </div>
        </ResultCard>
      )}

      {data.bns_sections && (
        <ResultCard title="BNS Section Suggestions">
          {Array.isArray(data.bns_sections) ? (
            <div className="flex flex-wrap gap-2">{data.bns_sections.map((s: any, i: number) => (
              <StatusPill key={i} label={typeof s === "string" ? s : s.section || s.name} variant="default" />
            ))}</div>
          ) : <p className="text-sm">{data.bns_sections}</p>}
        </ResultCard>
      )}

      {data.legal_reasoning && <ResultCard title="Legal Reasoning"><p className="text-sm whitespace-pre-wrap text-muted-foreground">{data.legal_reasoning}</p></ResultCard>}
      {data.jurisdiction && <ResultCard title="Jurisdiction"><p className="text-sm">{typeof data.jurisdiction === "string" ? data.jurisdiction : JSON.stringify(data.jurisdiction)}</p></ResultCard>}

      {(data.completeness_score !== undefined || data.case_strength_score !== undefined) && (
        <div className="grid grid-cols-2 gap-4">
          {data.completeness_score !== undefined && (
            <ResultCard title="Completeness">
              <div className="text-3xl font-display font-bold">{data.completeness_score}<span className="text-sm text-muted-foreground">%</span></div>
            </ResultCard>
          )}
          {data.case_strength_score !== undefined && (
            <ResultCard title="Case Strength">
              <div className="text-3xl font-display font-bold">{data.case_strength_score}<span className="text-sm text-muted-foreground">%</span></div>
            </ResultCard>
          )}
        </div>
      )}

      {(data.draft || data.fir_draft) && (
        <ResultCard title="FIR Draft">
          <pre className="text-sm whitespace-pre-wrap font-body leading-relaxed">{data.draft || data.fir_draft}</pre>
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={handleDownload}><Download className="h-4 w-4 mr-2" /> Download</Button>
          </div>
        </ResultCard>
      )}
    </div>
  );
}
