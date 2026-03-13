import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, CreditCard, Globe2, ImageIcon, Languages, MapPin, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { registerLawyerProfile } from "@/services/api";

type LawyerRegistrationForm = {
  name: string;
  handle: string;
  barCouncilId: string;
  yearsOfPractice: string;
  specialization: string;
  courtsPracticedIn: string;
  city: string;
  languages: string;
  consultationFee: string;
  profilePhotoUrl: string;
  bio: string;
  about: string;
  caseExperience: string;
};

const initialForm: LawyerRegistrationForm = {
  name: "",
  handle: "",
  barCouncilId: "",
  yearsOfPractice: "",
  specialization: "",
  courtsPracticedIn: "",
  city: "",
  languages: "",
  consultationFee: "",
  profilePhotoUrl: "",
  bio: "",
  about: "",
  caseExperience: "",
};

export default function LawyerRegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<LawyerRegistrationForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await registerLawyerProfile({
        handle: form.handle,
        name: form.name,
        bar_council_id: form.barCouncilId,
        years_of_practice: Number.parseInt(form.yearsOfPractice, 10),
        specialization: form.specialization,
        courts_practiced_in: form.courtsPracticedIn,
        city: form.city,
        languages: form.languages.split(",").map((item) => item.trim()).filter(Boolean),
        consultation_fee: form.consultationFee,
        profile_photo_url: form.profilePhotoUrl || undefined,
        bio: form.bio,
        about: form.about || undefined,
        case_experience: form.caseExperience.split("\n").map((item) => item.trim()).filter(Boolean),
      });

      toast({
        title: "Profile submitted",
        description: response.message,
      });
      navigate(`/lawyer/${response.profile.handle}`);
    } catch (error) {
      toast({
        title: "Unable to submit profile",
        description: error instanceof Error ? error.message : "Please review your details and try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function update<K extends keyof LawyerRegistrationForm>(key: K, value: LawyerRegistrationForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="rounded-[32px] border-slate-200 bg-white/95 shadow-xl shadow-slate-200/40">
          <CardContent className="space-y-6 p-8">
            <div className="space-y-3">
              <Badge variant="outline" className="rounded-full border-slate-300 bg-slate-50 px-4 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-600">
                Lawyer self registration
              </Badge>
              <h1 className="font-display text-5xl font-bold tracking-tight text-slate-950">Create your NyayaSetu lawyer profile</h1>
              <p className="max-w-3xl text-base leading-7 text-slate-600">
                Build a verified public profile with a unique handle, practice details, consultation fee, and professional bio for citizen trust and discovery.
              </p>
            </div>

            <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Name</span>
                <Input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Advocate Ananya Sharma" required />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Unique Handle</span>
                <Input value={form.handle} onChange={(event) => update("handle", event.target.value)} placeholder="@adv_sharma" required />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Bar Council ID</span>
                <Input value={form.barCouncilId} onChange={(event) => update("barCouncilId", event.target.value)} placeholder="D/1234/2016" required />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Years of Practice</span>
                <Input value={form.yearsOfPractice} onChange={(event) => update("yearsOfPractice", event.target.value)} placeholder="8" inputMode="numeric" required />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Specialization</span>
                <Input value={form.specialization} onChange={(event) => update("specialization", event.target.value)} placeholder="Criminal Law, Cyber Crime" required />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Courts Practiced In</span>
                <Input value={form.courtsPracticedIn} onChange={(event) => update("courtsPracticedIn", event.target.value)} placeholder="Delhi High Court, Sessions Court" required />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">City</span>
                <Input value={form.city} onChange={(event) => update("city", event.target.value)} placeholder="New Delhi" required />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Languages</span>
                <Input value={form.languages} onChange={(event) => update("languages", event.target.value)} placeholder="English, Hindi" required />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Consultation Fee</span>
                <Input value={form.consultationFee} onChange={(event) => update("consultationFee", event.target.value)} placeholder="INR 2,500" required />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Profile Photo URL</span>
                <Input value={form.profilePhotoUrl} onChange={(event) => update("profilePhotoUrl", event.target.value)} placeholder="https://example.com/photo.jpg" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Bio</span>
                <Textarea
                  rows={5}
                  value={form.bio}
                  onChange={(event) => update("bio", event.target.value)}
                  placeholder="Tell citizens about your practice, strengths, and legal approach."
                  required
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">About</span>
                <Textarea
                  rows={4}
                  value={form.about}
                  onChange={(event) => update("about", event.target.value)}
                  placeholder="Add a fuller professional summary for your public profile."
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Case Experience</span>
                <Textarea
                  rows={4}
                  value={form.caseExperience}
                  onChange={(event) => update("caseExperience", event.target.value)}
                  placeholder={"One item per line\nLed cyber-fraud complaint strategy\nRepresented clients in Delhi High Court bail matters"}
                />
              </label>
              <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={submitting} className="rounded-full bg-slate-950 px-8 text-amber-50 hover:bg-slate-900">
                  {submitting ? "Submitting..." : "Submit for verification"}
                </Button>
                <p className="text-sm text-slate-500">Profiles are stored in the backend database and marked pending until verified.</p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="rounded-[30px] border-slate-200 bg-slate-950 text-slate-50 shadow-xl shadow-slate-900/15">
            <CardContent className="space-y-4 p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">What your profile unlocks</p>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"><UserRound className="h-4 w-4 text-amber-300" /> Public professional profile</div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"><BadgeCheck className="h-4 w-4 text-amber-300" /> Verification badge</div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"><Globe2 className="h-4 w-4 text-amber-300" /> Searchable public handle URL</div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"><CreditCard className="h-4 w-4 text-amber-300" /> Consultation visibility</div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[30px] border-amber-200 bg-gradient-to-br from-amber-100 via-white to-amber-50 shadow-xl shadow-amber-100/60">
            <CardContent className="space-y-4 p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Required profile details</p>
              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-slate-500" /> City and courts practiced in</div>
                <div className="flex items-center gap-3"><Languages className="h-4 w-4 text-slate-500" /> Languages supported</div>
                <div className="flex items-center gap-3"><ImageIcon className="h-4 w-4 text-slate-500" /> Public photo URL and short bio</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
