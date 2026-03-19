import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Briefcase, Landmark, Scale, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

const roleOptions = [
  {
    value: "citizen",
    title: "Citizen",
    description: "Get immediate access to legal help, saved FIR drafts, and lawyer discovery.",
    icon: UserRound,
  },
  {
    value: "lawyer",
    title: "Lawyer",
    description: "Request professional access for lawyer dashboard, network publishing, and verified profiles.",
    icon: Briefcase,
  },
  {
    value: "police",
    title: "Police",
    description: "Request approval for police workflows, FIR drafting, and operational dashboards.",
    icon: Landmark,
  },
] as const;

export default function RegisterPage() {
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof roleOptions)[number]["value"]>("citizen");
  const [professionalId, setProfessionalId] = useState("");
  const [organization, setOrganization] = useState("");
  const [city, setCity] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await register({
        full_name: fullName,
        email,
        password,
        role,
        professional_id: professionalId || null,
        organization: organization || null,
        city: city || null,
        preferred_language: preferredLanguage,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create your account right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.18),transparent_20%),linear-gradient(180deg,#f8fafc_0%,#eff6ff_100%)] px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="w-full shadow-lg">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl gradient-accent flex items-center justify-center">
              <Scale className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Create account</CardTitle>
              <CardDescription>
                Choose your role first. Citizen access starts immediately, while lawyer and police access go into the approval queue.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <Label>Choose your role</Label>
              <div className="grid gap-3 md:grid-cols-3">
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  const active = role === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value)}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        active
                          ? "border-slate-950 bg-slate-950 text-amber-50 shadow-lg"
                          : "border-border bg-card hover:border-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-semibold">{option.title}</span>
                      </div>
                      <p className={`mt-2 text-sm leading-6 ${active ? "text-amber-100" : "text-muted-foreground"}`}>
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Lucknow" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Preferred language</Label>
                <select
                  id="language"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
            </div>
            {role !== "citizen" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="professionalId">{role === "lawyer" ? "Bar Council ID" : "Badge / Employee ID"}</Label>
                  <Input
                    id="professionalId"
                    value={professionalId}
                    onChange={(e) => setProfessionalId(e.target.value)}
                    placeholder={role === "lawyer" ? "D/1234/2016" : "Police badge or employee ID"}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization">{role === "lawyer" ? "Court / Chamber / Firm" : "Police Station / Unit"}</Label>
                  <Textarea
                    id="organization"
                    rows={3}
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder={role === "lawyer" ? "Delhi High Court, Criminal Bar..." : "Hazratganj Police Station, Cyber Cell..."}
                  />
                </div>
              </>
            ) : null}
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <Alert>
              <ShieldCheck className="h-4 w-4" />
              <AlertDescription>
                {role === "citizen"
                  ? "Citizen accounts are approved immediately."
                  : `${role === "lawyer" ? "Lawyer" : "Police"} accounts stay active as citizen accounts until an admin approves the requested professional role.`}
              </AlertDescription>
            </Alert>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
      <div className="space-y-5">
        <Card className="rounded-[30px] border-slate-200 bg-slate-950 text-slate-50 shadow-xl shadow-slate-900/15">
          <CardContent className="space-y-4 p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">How approvals work</p>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">Citizen accounts: immediate access</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">Lawyer accounts: pending until admin verification</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">Police accounts: pending until admin verification</div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[30px] border-amber-200 bg-gradient-to-br from-amber-100 via-white to-amber-50 shadow-xl shadow-amber-100/60">
          <CardContent className="space-y-3 p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">What happens next</p>
            <p className="text-sm leading-7 text-slate-700">
              After account creation, NyayaSetu stores your requested role, ID details, organization, and city so the admin panel can review the application with context.
            </p>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
