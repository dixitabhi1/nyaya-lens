import { useEffect, useState } from "react";
import { AlertTriangle, FileCheck2, MapPinned, ShieldCheck, TimerReset } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fallbackPoliceDashboardResponse } from "@/lib/nyayasetu-data";
import { getPoliceDashboard, type PoliceDashboardResponse } from "@/services/api";

export default function PoliceDashboardPage() {
  const [dashboard, setDashboard] = useState<PoliceDashboardResponse>(fallbackPoliceDashboardResponse);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const data = await getPoliceDashboard(8);
        if (!active) {
          return;
        }
        setDashboard(data);
        setUsingFallback(false);
      } catch {
        if (!active) {
          return;
        }
        setDashboard(fallbackPoliceDashboardResponse);
        setUsingFallback(true);
      }
    }

    void loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {usingFallback ? (
          <p className="text-sm text-amber-700">
            Live police metrics are temporarily unavailable. Showing bundled preview operations data.
          </p>
        ) : null}

        <section className="space-y-4">
          <Badge variant="outline" className="rounded-full border-slate-300 bg-white px-4 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-600">
            Police dashboard
          </Badge>
          <h1 className="font-display text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
            Review complaints, generate FIR drafts, and watch crime patterns.
          </h1>
          <p className="max-w-3xl text-base leading-8 text-slate-600">
            This dashboard is designed to reduce paperwork, improve FIR quality, and surface location-based intelligence for law enforcement teams.
          </p>
        </section>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {dashboard.cards.map((card) => (
            <Card key={card.title} className="rounded-[28px] border-slate-200 bg-white shadow-lg shadow-slate-200/40">
              <CardContent className="space-y-3 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{card.title}</p>
                <p className="text-3xl font-semibold text-slate-950">{card.value}</p>
                <p className="text-sm leading-7 text-slate-600">{card.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="rounded-[30px] border-slate-200 bg-white shadow-xl shadow-slate-200/40">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-amber-200">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Review queue</p>
                  <p className="text-2xl font-semibold text-slate-950">Complaint and FIR drafting pipeline</p>
                </div>
              </div>

              <div className="space-y-4">
                {dashboard.queue.map((item) => (
                  <div key={item.fir_id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-950">{item.title}</p>
                      <Badge className="rounded-full bg-slate-950 text-amber-100 hover:bg-slate-950">
                        {item.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.detail}</p>
                    {item.police_station ? (
                      <p className="mt-3 text-xs uppercase tracking-[0.22em] text-slate-500">{item.police_station}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-[30px] border-slate-200 bg-white shadow-xl shadow-slate-200/40">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <MapPinned className="h-5 w-5 text-rose-500" />
                  <h2 className="text-2xl font-semibold text-slate-950">Crime hotspot alerts</h2>
                </div>
                <div className="space-y-3">
                  {dashboard.hotspot_alerts.map((alert) => (
                    <div key={alert.title} className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4 text-sm leading-7 text-slate-700">
                      <p className="font-semibold text-slate-900">{alert.title}</p>
                      <p className="mt-2">{alert.detail}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[30px] border-amber-200 bg-gradient-to-br from-amber-100 via-white to-amber-50 shadow-xl shadow-amber-100/60">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-slate-700" />
                  <h2 className="text-2xl font-semibold text-slate-950">AI workflow support</h2>
                </div>
                <div className="space-y-3 text-sm leading-7 text-slate-700">
                  <div className="flex items-center gap-3"><TimerReset className="h-4 w-4 text-slate-500" /> Faster complaint intake and triage</div>
                  <div className="flex items-center gap-3"><AlertTriangle className="h-4 w-4 text-slate-500" /> Early signal for missing FIR fields</div>
                  <div className="flex items-center gap-3"><FileCheck2 className="h-4 w-4 text-slate-500" /> Better evidence-linked FIR drafting quality</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
