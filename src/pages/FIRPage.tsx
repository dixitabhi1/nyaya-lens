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
import { Download, Eye, Send } from "lucide-react";
import {
  firManualPreview,
  firManualSubmit,
  firUploadPreview,
  firUploadSubmit,
  firVoicePreview,
  firVoiceSubmit,
} from "@/services/api";
import FIRResult from "@/components/fir/FIRResult";

function ManualTab() {
  const [form, setForm] = useState({
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
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [submitted, setSubmitted] = useState<any>(null);
  const [error, setError] = useState("");

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
  });

  const handlePreview = async () => {
    setLoading(true); setError("");
    try { setPreview(await firManualPreview(buildPayload())); } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try { setSubmitted(await firManualSubmit(buildPayload())); } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
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
