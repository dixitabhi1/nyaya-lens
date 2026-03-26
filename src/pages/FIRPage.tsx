import { useState, useEffect, useCallback } from "react";
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
import { Download, Eye, Send, Save, Clock, FileText, ChevronRight, RotateCcw, X, Mic } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  firManualPreview,
  firManualSubmit,
  firUploadPreview,
  firUploadSubmit,
  firVoicePreview,
  firVoiceSubmit,
  firGet,
  firVersions,
  firUpdateDraft,
  firList,
} from "@/services/api";
import FIRResult from "@/components/fir/FIRResult";
import { VoiceTranscriptionDialog } from "@/components/fir/VoiceTranscriptionDialog";

const STORAGE_KEY = "nyayasetu_fir_manual_form";
const STORAGE_TAB_KEY = "nyayasetu_fir_active_tab";
type DraftRole = "citizen_application" | "police_fir" | "lawyer_analysis";
type DraftLanguage = "en" | "hi";

const defaultForm = {
  complainant_name: "",
  parent_name: "",
  address: "",
  contact_number: "",
  police_station: "",
  incident_date: "",
  incident_time: "",
  incident_location: "",
  incident_description: "",
  accused_details: "",
  witness_details: "",
  evidence_information: "",
};

const draftRoleMeta: Record<DraftRole, { title: string; description: string; access: "public" | "police" | "lawyer" }> = {
  citizen_application: {
    title: "Citizen Application",
    description: "Draft a complaint application for submission to a police station or police officer.",
    access: "public",
  },
  police_fir: {
    title: "Police FIR Draft",
    description: "Transform the complaint application into a structured FIR draft for police review.",
    access: "police",
  },
  lawyer_analysis: {
    title: "Lawyer FIR Analysis",
    description: "Generate a lawyer-focused review note with comparative sections and review checks.",
    access: "lawyer",
  },
};

function ManualTab({ draftRole, language }: { draftRole: DraftRole; language: DraftLanguage }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [submitted, setSubmitted] = useState<any>(null);
  const [error, setError] = useState("");
  const [restored, setRestored] = useState(false);

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasData = Object.values(parsed).some((v) => typeof v === "string" && v.trim() !== "");
        if (hasData) {
          setForm(parsed);
          setRestored(true);
          setTimeout(() => setRestored(false), 5000);
        }
      }
    } catch {}
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const buildPayload = () => ({
    complainant_name: form.complainant_name,
    parent_name: form.parent_name,
    address: form.address,
    contact_number: form.contact_number,
    police_station: form.police_station,
    incident_date: form.incident_date,
    incident_time: form.incident_time,
    incident_location: form.incident_location,
    incident_description: form.incident_description,
    accused_details: form.accused_details.split(",").map((s) => s.trim()).filter(Boolean),
    witness_details: form.witness_details.split(",").map((s) => s.trim()).filter(Boolean),
    evidence_information: form.evidence_information.split(",").map((s) => s.trim()).filter(Boolean),
    draft_role: draftRole,
    language,
  });

  const handlePreview = async () => {
    setLoading(true); setError("");
    try {
      setSubmitted(null);
      setPreview(await firManualPreview(buildPayload()));
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      setPreview(null);
      const result = await firManualSubmit(buildPayload());
      setSubmitted(result);
      // Clear saved form on successful submit
      localStorage.removeItem(STORAGE_KEY);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const handleClear = () => {
    setForm(defaultForm);
    localStorage.removeItem(STORAGE_KEY);
    setPreview(null);
    setSubmitted(null);
    setError("");
  };

  return (
    <div className="space-y-4">
      {restored && (
        <NoticeBanner variant="info">
          Restored your last FIR draft session
        </NoticeBanner>
      )}
      <Input placeholder="Complainant Name" value={form.complainant_name} onChange={(e) => update("complainant_name", e.target.value)} />
      <Input placeholder="Parent/Guardian Name" value={form.parent_name} onChange={(e) => update("parent_name", e.target.value)} />
      <Input placeholder="Address *" value={form.address} onChange={(e) => update("address", e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input placeholder="Contact Number" value={form.contact_number} onChange={(e) => update("contact_number", e.target.value)} />
        <Input placeholder="Police Station *" value={form.police_station} onChange={(e) => update("police_station", e.target.value)} />
      </div>
      <Textarea placeholder="Incident description..." value={form.incident_description} onChange={(e) => update("incident_description", e.target.value)} rows={4} />
      <div className="grid grid-cols-2 gap-3">
        <Input type="date" value={form.incident_date} onChange={(e) => update("incident_date", e.target.value)} />
        <Input type="time" value={form.incident_time} onChange={(e) => update("incident_time", e.target.value)} />
      </div>
      <Input placeholder="Incident Location" value={form.incident_location} onChange={(e) => update("incident_location", e.target.value)} />
      <Input placeholder="Accused details (comma-separated)" value={form.accused_details} onChange={(e) => update("accused_details", e.target.value)} />
      <Input placeholder="Witness details (comma-separated)" value={form.witness_details} onChange={(e) => update("witness_details", e.target.value)} />
      <Input placeholder="Evidence information (comma-separated)" value={form.evidence_information} onChange={(e) => update("evidence_information", e.target.value)} />
      <div className="flex gap-2">
        <Button variant="outline" onClick={handlePreview} disabled={loading}><Eye className="h-4 w-4 mr-2" /> Preview</Button>
        <Button onClick={handleSubmit} disabled={loading}><Send className="h-4 w-4 mr-2" /> Submit FIR</Button>
        <Button variant="ghost" onClick={handleClear} disabled={loading}><RotateCcw className="h-4 w-4 mr-2" /> Clear</Button>
      </div>
      {loading && <LoadingState />}
      {error && <NoticeBanner variant="error">{error}</NoticeBanner>}
      {(preview || submitted) && <FIRResult data={preview || submitted} />}
    </div>
  );
}

function UploadTab({ draftRole, language }: { draftRole: DraftRole; language: DraftLanguage }) {
  const [file, setFile] = useState<File | null>(null);
  const [policeStation, setPoliceStation] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [submitted, setSubmitted] = useState<any>(null);
  const [error, setError] = useState("");

  const makeForm = () => {
    const fd = new FormData();
    if (file) fd.append("complaint_file", file);
    if (policeStation.trim()) fd.append("police_station", policeStation.trim());
    fd.append("draft_role", draftRole);
    fd.append("language", language);
    return fd;
  };

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true); setError("");
    try {
      setSubmitted(null);
      setPreview(await firUploadPreview(makeForm()));
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true); setError("");
    try {
      setPreview(null);
      setSubmitted(await firUploadSubmit(makeForm()));
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <FileUpload onFile={setFile} label="Upload complaint document" />
      <Input placeholder="Police Station (optional)" value={policeStation} onChange={(e) => setPoliceStation(e.target.value)} />
      <div className="flex gap-2">
        <Button variant="outline" onClick={handlePreview} disabled={loading || !file}><Eye className="h-4 w-4 mr-2" /> Preview</Button>
        <Button onClick={handleSubmit} disabled={loading || !file}><Send className="h-4 w-4 mr-2" /> Submit</Button>
      </div>
      {loading && <LoadingState />}
      {error && <NoticeBanner variant="error">{error}</NoticeBanner>}
      {(preview || submitted) && <FIRResult data={preview || submitted} />}
    </div>
  );
}

function VoiceTab({ draftRole, language }: { draftRole: DraftRole; language: DraftLanguage }) {
  const [file, setFile] = useState<File | null>(null);
  const [transcriptText, setTranscriptText] = useState("");
  const [policeStation, setPoliceStation] = useState("");
  const [complainantName, setComplainantName] = useState("");
  const [recorderOpen, setRecorderOpen] = useState(false);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [submitted, setSubmitted] = useState<any>(null);
  const [error, setError] = useState("");

  const makeForm = () => {
    const fd = new FormData();
    if (file) fd.append("audio_file", file);
    if (transcriptText.trim()) fd.append("transcript_text", transcriptText.trim());
    if (policeStation.trim()) fd.append("police_station", policeStation.trim());
    if (complainantName.trim()) fd.append("complainant_name", complainantName.trim());
    fd.append("draft_role", draftRole);
    fd.append("language", language);
    return fd;
  };

  const handlePreview = async () => {
    if (!file && !transcriptText.trim()) return;
    setLoading(true); setError("");
    try {
      setSubmitted(null);
      setPreview(await firVoicePreview(makeForm()));
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!file && !transcriptText.trim()) return;
    setLoading(true); setError("");
    try {
      setPreview(null);
      setSubmitted(await firVoiceSubmit(makeForm()));
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const handleRecorderApply = ({ file: recordedFile, transcriptText: nextTranscript, durationSeconds }: {
    file: File | null;
    transcriptText: string;
    durationSeconds: number;
  }) => {
    if (recordedFile) {
      setFile(recordedFile);
      setVoiceNoteDuration(durationSeconds);
    }
    if (nextTranscript.trim()) {
      setTranscriptText(nextTranscript.trim());
    }
    setError("");
  };

  return (
    <div className="space-y-4">
      <NoticeBanner variant="info">
        Voice FIR works best when you record through the NyayaSetu mic popup, review the transcript, and then preview the FIR draft before submitting it.
      </NoticeBanner>
      <FileUpload file={file} onFile={setFile} accept="audio/*" label="Upload voice recording" />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => setRecorderOpen(true)}>
          <Mic className="h-4 w-4 mr-2" /> Record voice note
        </Button>
        {file ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setFile(null);
              setVoiceNoteDuration(null);
            }}
          >
            Remove voice note
          </Button>
        ) : null}
      </div>
      {file ? (
        <NoticeBanner variant="success">
          Attached voice note: <strong>{file.name}</strong>
          {voiceNoteDuration ? ` (${Math.max(1, voiceNoteDuration)} sec)` : ""}
        </NoticeBanner>
      ) : null}
      <Textarea
        placeholder="Paste or generate transcript text from the mic popup"
        value={transcriptText}
        onChange={(e) => setTranscriptText(e.target.value)}
        rows={6}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input placeholder="Police Station (optional)" value={policeStation} onChange={(e) => setPoliceStation(e.target.value)} />
        <Input placeholder="Complainant Name (optional)" value={complainantName} onChange={(e) => setComplainantName(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handlePreview} disabled={loading || (!file && !transcriptText.trim())}><Eye className="h-4 w-4 mr-2" /> Preview</Button>
        <Button onClick={handleSubmit} disabled={loading || (!file && !transcriptText.trim())}><Send className="h-4 w-4 mr-2" /> Submit</Button>
      </div>
      {loading && <LoadingState />}
      {error && <NoticeBanner variant="error">{error}</NoticeBanner>}
      {(preview || submitted) && <FIRResult data={preview || submitted} />}
      <VoiceTranscriptionDialog
        open={recorderOpen}
        onOpenChange={setRecorderOpen}
        onApply={handleRecorderApply}
        initialTranscript={transcriptText}
        language={language}
      />
    </div>
  );
}

function SavedFIRs({ onOpen }: { onOpen: (firId: string) => void }) {
  const [firs, setFirs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await firList(25);
      setFirs(Array.isArray(data) ? data : data?.records || data?.firs || data?.items || []);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState />;
  if (error) return <NoticeBanner variant="error">{error}</NoticeBanner>;
  if (!firs.length) return <EmptyState message="No saved FIRs found" />;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Saved FIRs</h3>
      {firs.map((fir: any) => (
        <div
          key={fir.fir_id || fir.id}
          className="border rounded-lg p-4 hover:bg-secondary/30 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{fir.complainant_name || fir.complainant?.name || "Unknown"}</span>
                {fir.case_strength_score !== undefined && (
                  <StatusPill label={`Strength: ${fir.case_strength_score}%`} variant="default" />
                )}
                {(fir.current_version !== undefined || fir.version !== undefined) && (
                  <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">v{fir.current_version ?? fir.version}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {fir.police_station && <span>🏛 {fir.police_station}</span>}
                {fir.incident_date && <span>📅 {fir.incident_date}</span>}
                {fir.incident_location && <span>📍 {fir.incident_location}</span>}
                {(fir.last_edited_at || fir.updated_at) && <span>🕐 {new Date(fir.last_edited_at || fir.updated_at).toLocaleString()}</span>}
              </div>
              {(fir.draft_excerpt || fir.draft || fir.fir_draft) && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {(fir.draft_excerpt || fir.draft || fir.fir_draft).slice(0, 150)}…
                </p>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={() => onOpen(fir.fir_id || fir.id)}>
              <FileText className="h-3.5 w-3.5 mr-1" /> Open
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function FIREditor({ firId, onClose }: { firId: string; onClose: () => void }) {
  const [fir, setFir] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadFir = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [firData, versionData] = await Promise.all([
        firGet(firId),
        firVersions(firId).catch(() => []),
      ]);
      setFir(firData);
      setDraft(firData.draft_text || firData.draft || firData.fir_draft || "");
      setVersions(Array.isArray(versionData) ? versionData : versionData?.versions || []);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, [firId]);

  useEffect(() => { loadFir(); }, [loadFir]);

  const handleSave = async () => {
    setSaving(true); setError(""); setSaveSuccess(false);
    try {
      await firUpdateDraft(firId, {
        draft_text: draft,
        document_kind: fir?.draft_role || "citizen_application",
        language: fir?.draft_language || "en",
        edit_summary: "Updated from NyayaSetu FIR editor",
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      // Reload to get updated version
      const [firData, versionData] = await Promise.all([
        firGet(firId),
        firVersions(firId).catch(() => []),
      ]);
      setFir(firData);
      setVersions(Array.isArray(versionData) ? versionData : versionData?.versions || []);
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  if (loading) return <LoadingState />;
  if (error && !fir) return <NoticeBanner variant="error">{error}</NoticeBanner>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Editing FIR</h3>
          <code className="text-xs bg-secondary px-2 py-0.5 rounded font-mono">{firId}</code>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>

      {fir && <FIRResult data={{ ...fir, draft: undefined, fir_draft: undefined }} />}

      <ResultCard title="FIR Draft (Editable)">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={12}
          className="font-mono text-sm"
        />
        <div className="flex items-center gap-2 mt-3">
          <Button onClick={handleSave} disabled={saving} size="sm">
            <Save className="h-4 w-4 mr-2" /> {saving ? "Saving…" : "Save Draft"}
          </Button>
          {saveSuccess && <span className="text-xs text-success">✓ Saved</span>}
        </div>
      </ResultCard>

      {error && <NoticeBanner variant="error">{error}</NoticeBanner>}

      {versions.length > 0 && (
        <ResultCard title="Version History">
          <div className="space-y-2">
            {versions.map((v: any, i: number) => (
              <div key={i} className="flex items-center gap-3 text-sm border-b last:border-0 pb-2 last:pb-0">
              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{v.version_number ? `v${v.version_number}` : v.version ? `v${v.version}` : `#${i + 1}`}</span>
                <span className="text-xs text-muted-foreground">
                  {v.created_at || v.timestamp ? new Date(v.created_at || v.timestamp).toLocaleString() : ""}
                </span>
                {(v.edit_summary || v.changes_summary) && <span className="text-xs truncate">{v.edit_summary || v.changes_summary}</span>}
              </div>
            ))}
          </div>
        </ResultCard>
      )}
    </div>
  );
}

export default function FIRPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(STORAGE_TAB_KEY) || "manual";
  });
  const [editingFirId, setEditingFirId] = useState<string | null>(null);
  const [draftRole, setDraftRole] = useState<DraftRole>("citizen_application");
  const [language, setLanguage] = useState<DraftLanguage>("en");

  const canAccessPolice = Boolean(user?.can_access_police_dashboard);
  const canAccessLawyer = Boolean(user?.can_access_lawyer_dashboard);

  useEffect(() => {
    if (draftRole === "police_fir" && !canAccessPolice) {
      setDraftRole("citizen_application");
    }
    if (draftRole === "lawyer_analysis" && !canAccessLawyer) {
      setDraftRole("citizen_application");
    }
  }, [draftRole, canAccessPolice, canAccessLawyer]);

  useEffect(() => {
    localStorage.setItem(STORAGE_TAB_KEY, activeTab);
  }, [activeTab]);

  if (editingFirId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <PageHeader title="FIR Generator" description="Editing a saved FIR draft." />
        <FIREditor firId={editingFirId} onClose={() => setEditingFirId(null)} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader title="FIR Generator" description="Generate First Information Reports through manual entry, complaint upload, or voice recording." />
      <div className="space-y-4 mb-6">
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Choose document track</p>
              <p className="text-sm text-muted-foreground">
                Citizens can draft complaint applications immediately. Police and lawyer tracks unlock after approval.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {(Object.keys(draftRoleMeta) as DraftRole[]).map((value) => {
                const meta = draftRoleMeta[value];
                const locked =
                  (meta.access === "police" && !canAccessPolice) ||
                  (meta.access === "lawyer" && !canAccessLawyer);
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={locked}
                    onClick={() => setDraftRole(value)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      draftRole === value
                        ? "border-slate-950 bg-slate-950 text-amber-50"
                        : "border-border bg-background hover:border-slate-400 hover:bg-slate-50"
                    } ${locked ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{meta.title}</span>
                      {locked && <StatusPill label="Approval required" variant="warning" />}
                    </div>
                    <p className={`mt-2 text-sm leading-6 ${draftRole === value ? "text-amber-100" : "text-muted-foreground"}`}>
                      {meta.description}
                    </p>
                  </button>
                );
              })}
            </div>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
              <div>
                <p className="text-sm font-medium text-foreground">Active lane</p>
                <p className="text-sm text-muted-foreground">{draftRoleMeta[draftRole].description}</p>
              </div>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Language</span>
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as DraftLanguage)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        {!canAccessPolice || !canAccessLawyer ? (
          <NoticeBanner variant="info">
            Professional FIR lanes stay locked until the requested lawyer or police role is approved. Citizen complaint drafting remains available immediately.
          </NoticeBanner>
        ) : null}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="upload">Complaint Upload</TabsTrigger>
          <TabsTrigger value="voice">Voice Filing</TabsTrigger>
          <TabsTrigger value="saved">Saved FIRs</TabsTrigger>
        </TabsList>
        <TabsContent value="manual"><ManualTab draftRole={draftRole} language={language} /></TabsContent>
        <TabsContent value="upload"><UploadTab draftRole={draftRole} language={language} /></TabsContent>
        <TabsContent value="voice"><VoiceTab draftRole={draftRole} language={language} /></TabsContent>
        <TabsContent value="saved"><SavedFIRs onOpen={(id) => setEditingFirId(id)} /></TabsContent>
      </Tabs>
    </div>
  );
}
