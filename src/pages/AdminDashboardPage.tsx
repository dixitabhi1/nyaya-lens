import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Clock3, FileWarning, ShieldCheck, UserCheck, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  getAdminDashboard,
  updateRoleApproval,
  type AdminDashboardResponse,
  type PendingRoleApplication,
} from "@/services/api";

const statusActions = [
  { label: "Approve", value: "approved" as const, className: "bg-emerald-600 text-white hover:bg-emerald-700" },
  { label: "Keep Pending", value: "pending" as const, className: "bg-slate-200 text-slate-900 hover:bg-slate-300" },
  { label: "Reject", value: "rejected" as const, className: "bg-rose-600 text-white hover:bg-rose-700" },
];

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  async function loadDashboard() {
    try {
      const data = await getAdminDashboard();
      setDashboard(data);
      setError("");
      setNotes((current) => {
        const next = { ...current };
        for (const application of data.pending_applications) {
          if (!(application.id in next)) {
            next[application.id] = application.approval_notes || "";
          }
        }
        return next;
      });
    } catch (err: any) {
      setError(err?.message || "Unable to load the admin dashboard.");
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function handleApproval(application: PendingRoleApplication, status: "approved" | "pending" | "rejected") {
    setSavingId(application.id);
    try {
      await updateRoleApproval(application.id, status, notes[application.id]?.trim() || undefined);
      toast({
        title: "Approval updated",
        description: `${application.full_name} is now marked ${status}.`,
      });
      await loadDashboard();
    } catch (err) {
      toast({
        title: "Unable to update approval",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  }

  const metrics = useMemo(() => dashboard?.metrics || [], [dashboard]);

  if (error && !dashboard) {
    return (
      <div className="min-h-full bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Card className="rounded-[28px] border-slate-200 bg-white shadow-xl shadow-slate-200/40">
            <CardContent className="space-y-4 p-8 text-center">
              <p className="font-display text-4xl font-bold text-slate-950">Admin panel unavailable</p>
              <p className="text-base text-slate-600">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-full bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Card className="rounded-[28px] border-slate-200 bg-white shadow-xl shadow-slate-200/40">
            <CardContent className="space-y-4 p-8 text-center">
              <p className="font-display text-4xl font-bold text-slate-950">Loading admin panel</p>
              <p className="text-base text-slate-600">Fetching account approvals, lawyer profile reviews, and FIR activity.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.18),transparent_20%),linear-gradient(180deg,#f8fafc_0%,#eff6ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="rounded-[32px] border-0 bg-slate-950 text-slate-50 shadow-2xl shadow-slate-900/20">
            <CardContent className="space-y-5 p-8">
              <Badge className="w-fit rounded-full bg-amber-300 text-slate-950 hover:bg-amber-300">
                Admin review console
              </Badge>
              <h1 className="font-display text-5xl font-bold tracking-tight">
                Approve professionals, monitor filings, and keep the platform clean.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-300">
                Review police and lawyer applications with supporting profile details, watch recent FIR traffic, and keep operational access tightly controlled.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => void loadDashboard()} className="rounded-full bg-amber-300 text-slate-950 hover:bg-amber-200">
                  Refresh panel
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-slate-200 bg-white/90 shadow-xl shadow-slate-200/50">
            <CardContent className="space-y-4 p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Operational signals</p>
              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-5 w-5 text-slate-700" />
                    <span className="font-medium text-slate-950">{dashboard.pending_applications.length} approval requests loaded now</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-slate-700" />
                    <span className="font-medium text-slate-950">{dashboard.recent_lawyer_profiles.length} recent lawyer profiles visible</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <FileWarning className="h-5 w-5 text-slate-700" />
                    <span className="font-medium text-slate-950">{dashboard.recent_firs.length} recent FIR records available for review</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {metrics.map((metric) => (
            <Card key={metric.title} className="rounded-[26px] border-slate-200 bg-white/90 shadow-lg shadow-slate-200/40">
              <CardContent className="space-y-3 p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{metric.title}</p>
                <p className="font-display text-4xl font-bold text-slate-950">{metric.value}</p>
                <p className="text-sm leading-6 text-slate-600">{metric.detail}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <Card className="rounded-[32px] border-slate-200 bg-white/95 shadow-xl shadow-slate-200/40">
            <CardContent className="space-y-6 p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Approval queue</p>
                  <h2 className="font-display text-3xl font-bold text-slate-950">Lawyer and police applications</h2>
                </div>
                <Badge variant="outline" className="rounded-full border-slate-300 bg-slate-50 px-4 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-600">
                  Live data
                </Badge>
              </div>

              {dashboard.pending_applications.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-slate-500">
                  No pending professional approvals right now.
                </div>
              ) : (
                <div className="space-y-5">
                  {dashboard.pending_applications.map((application) => (
                    <div key={application.id} className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-semibold text-slate-950">{application.full_name}</h3>
                            <Badge className="rounded-full bg-slate-900 text-white hover:bg-slate-900">{application.requested_role}</Badge>
                            <Badge variant="outline" className="rounded-full border-slate-300 bg-white text-slate-600">
                              current role: {application.role}
                            </Badge>
                            <Badge variant="outline" className="rounded-full border-amber-300 bg-amber-50 text-amber-700">
                              {application.approval_status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">{application.email}</p>
                          <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                            <p><strong>Professional ID:</strong> {application.professional_id || "Not provided"}</p>
                            <p><strong>Organization:</strong> {application.organization || "Not provided"}</p>
                            <p><strong>City:</strong> {application.city || "Not provided"}</p>
                            <p><strong>Preferred language:</strong> {application.preferred_language}</p>
                            <p><strong>Created:</strong> {new Date(application.created_at).toLocaleString()}</p>
                            <p><strong>Last login:</strong> {application.last_login_at ? new Date(application.last_login_at).toLocaleString() : "Never"}</p>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                          <div className="flex items-center gap-2 text-slate-950">
                            <Clock3 className="h-4 w-4" />
                            Review notes
                          </div>
                          <p className="mt-2 max-w-xs leading-6">
                            {application.approval_notes || "No admin review note has been added yet."}
                          </p>
                        </div>
                      </div>

                      {application.linked_profile ? (
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
                          <div className="flex items-center gap-2 font-medium text-slate-950">
                            <BadgeCheck className="h-4 w-4 text-amber-500" />
                            Linked lawyer profile
                          </div>
                          <div className="mt-2 grid gap-2 md:grid-cols-2">
                            <p><strong>Handle:</strong> @{application.linked_profile.handle}</p>
                            <p><strong>Verification:</strong> {application.linked_profile.verification_status}</p>
                            <p><strong>Specialization:</strong> {application.linked_profile.specialization}</p>
                            <p><strong>Bar Council ID:</strong> {application.linked_profile.bar_council_id}</p>
                            <p><strong>City:</strong> {application.linked_profile.city}</p>
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-4 space-y-3">
                        <Input
                          value={notes[application.id] || ""}
                          onChange={(event) => setNotes((current) => ({ ...current, [application.id]: event.target.value }))}
                          placeholder="Add an approval note for the applicant"
                        />
                        <div className="flex flex-wrap gap-3">
                          {statusActions.map((action) => (
                            <Button
                              key={action.value}
                              type="button"
                              disabled={savingId === application.id}
                              className={`rounded-full ${action.className}`}
                              onClick={() => void handleApproval(application, action.value)}
                            >
                              {savingId === application.id ? "Saving..." : action.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-[30px] border-slate-200 bg-white/95 shadow-xl shadow-slate-200/40">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-slate-700" />
                  <h3 className="font-display text-2xl font-bold text-slate-950">Recent lawyer profiles</h3>
                </div>
                <div className="space-y-4">
                  {dashboard.recent_lawyer_profiles.map((profile) => (
                    <div key={`${profile.handle}-${profile.created_at}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="font-medium text-slate-950">{profile.name}</p>
                      <p className="mt-1 text-sm text-slate-600">@{profile.handle} | {profile.specialization}</p>
                      <p className="mt-1 text-sm text-slate-500">{profile.city} | {profile.verification_status}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        {profile.linked_user_email || "No linked user email"} | {new Date(profile.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[30px] border-slate-200 bg-white/95 shadow-xl shadow-slate-200/40">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-2">
                  <FileWarning className="h-5 w-5 text-slate-700" />
                  <h3 className="font-display text-2xl font-bold text-slate-950">Recent FIR activity</h3>
                </div>
                <div className="space-y-4">
                  {dashboard.recent_firs.map((fir) => (
                    <div key={fir.fir_id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="font-medium text-slate-950">{fir.complainant_name || "Unknown complainant"}</p>
                      <p className="mt-1 text-sm text-slate-600">{fir.workflow} | {fir.draft_role} | {fir.status}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {fir.police_station || "Police station pending"} | {fir.incident_location || "Location pending"}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">{new Date(fir.last_edited_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
