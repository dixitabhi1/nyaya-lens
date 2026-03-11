import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/PageHeader";
import { ResultCard } from "@/components/shared/ResultCard";
import { FileUpload } from "@/components/shared/FileUpload";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { NoticeBanner } from "@/components/shared/NoticeBanner";
import { StatusPill } from "@/components/shared/StatusPill";
import { Download, FileWarning, Eye, Send } from "lucide-react";
import {
  firManualPreview,
  firManualSubmit,
  firUploadPreview,
  firUploadSubmit,
  firVoicePreview,
  firVoiceSubmit,
  firGet,
  firVersions,
} from "@/services/api";

function ManualTab() {
  const [form, setForm] = useState({ complainant_name: "", incident_description: "", incident_date: "", incident_location: "" });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [submitted, setSubmitted] = useState<any>(null);
  const [error, setError] = useState("");

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handlePreview = async () => {
    setLoading(true); setError("");
    try { setPreview(await firManualPreview(form)); } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try { setSubmitted(await firManualSubmit(form)); } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <Input placeholder="Complainant Name" value={form.complainant_name} onChange={(e) => update("complainant_name", e.target.value)} />
      <Textarea placeholder="Incident description..." value={form.incident_description} onChange={(e) => update("incident_description", e.target.value)} rows={4} />
      <div className="grid grid-cols-2 gap-3">
        <Input type="date" value={form.incident_date} onChange={(e) => update("incident_date", e.target.value)} />
        <Input placeholder="Location" value={form.incident_location} onChange={(e) => update("incident_location", e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handlePreview} disabled={loading}><Eye className="h-4 w-4 mr-2" /> Preview</Button>
        <Button onClick={handleSubmit} disabled={loading}><Send className="h-4 w-4 mr-2" /> Submit FIR</Button>
      </div>
      {loading && <LoadingState />}
      {error && <NoticeBanner variant="error">{error}</NoticeBanner>}
      {(preview || submitted) && <FIRResult data={submitted || preview} />}
    </div>
  );
}

function UploadTab() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [submitted, setSubmitted] = useState<any>(null);
  const [error, setError] = useState("");

  const makeForm = () => { const fd = new FormData(); if (file) fd.append("complaint_file", file); return fd; };

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true); setError("");
    try { setPreview(await firUploadPreview(makeForm())); } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true); setError("");
    try { setSubmitted(await firUploadSubmit(makeForm())); } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <FileUpload onFile={setFile} label="Upload complaint document" />
      <div className="flex gap-2">
        <Button variant="outline" onClick={handlePreview} disabled={loading || !file}><Eye className="h-4 w-4 mr-2" /> Preview</Button>
        <Button onClick={handleSubmit} disabled={loading || !file}><Send className="h-4 w-4 mr-2" /> Submit</Button>
      </div>
      {loading && <LoadingState />}
      {error && <NoticeBanner variant="error">{error}</NoticeBanner>}
      {(preview || submitted) && <FIRResult data={submitted || preview} />}
    </div>
  );
}

function VoiceTab() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [submitted, setSubmitted] = useState<any>(null);
  const [error, setError] = useState("");

  const makeForm = () => { const fd = new FormData(); if (file) fd.append("audio_file", file); return fd; };

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true); setError("");
    try { setPreview(await firVoicePreview(makeForm())); } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true); setError("");
    try { setSubmitted(await firVoiceSubmit(makeForm())); } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <FileUpload onFile={setFile} accept="audio/*" label="Upload voice recording" />
      <div className="flex gap-2">
        <Button variant="outline" onClick={handlePreview} disabled={loading || !file}><Eye className="h-4 w-4 mr-2" /> Preview</Button>
        <Button onClick={handleSubmit} disabled={loading || !file}><Send className="h-4 w-4 mr-2" /> Submit</Button>
      </div>
      {loading && <LoadingState />}
      {error && <NoticeBanner variant="error">{error}</NoticeBanner>}
      {(preview || submitted) && <FIRResult data={submitted || preview} />}
    </div>
  );
}

function FIRResult({ data }: { data: any }) {
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

export default function FIRPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader title="FIR Generator" description="Generate First Information Reports through manual entry, complaint upload, or voice recording." />

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="upload">Complaint Upload</TabsTrigger>
          <TabsTrigger value="voice">Voice Filing</TabsTrigger>
        </TabsList>
        <TabsContent value="manual"><ManualTab /></TabsContent>
        <TabsContent value="upload"><UploadTab /></TabsContent>
        <TabsContent value="voice"><VoiceTab /></TabsContent>
      </Tabs>
    </div>
  );
}
