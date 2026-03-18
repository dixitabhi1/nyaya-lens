import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, Landmark, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { mergeLawyerDirectoryWithCache } from "@/lib/lawyer-cache";
import {
  dashboardCards,
  fallbackLawyerDirectoryResponse,
  fallbackPoliceDashboardResponse,
  quickPrompts,
} from "@/lib/nyayasetu-data";
import {
  getLawyers,
  getPoliceDashboard,
  type LawyerSummary,
  type PoliceDashboardCard,
} from "@/services/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const [lawyers, setLawyers] = useState<LawyerSummary[]>(
    mergeLawyerDirectoryWithCache(fallbackLawyerDirectoryResponse).lawyers,
  );
  const [policeCards, setPoliceCards] = useState<PoliceDashboardCard[]>(fallbackPoliceDashboardResponse.cards);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSidebarData() {
      try {
        const [directory, police] = await Promise.all([
          getLawyers({ limit: 3 }),
          getPoliceDashboard(3),
        ]);
        if (!active) {
          return;
        }
        setLawyers(mergeLawyerDirectoryWithCache(directory).lawyers);
        setPoliceCards(police.cards);
        setUsingFallback(false);
      } catch {
        if (!active) {
          return;
        }
        setLawyers(mergeLawyerDirectoryWithCache(fallbackLawyerDirectoryResponse).lawyers);
        setPoliceCards(fallbackPoliceDashboardResponse.cards);
        setUsingFallback(true);
      }
    }

    void loadSidebarData();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.16),transparent_20%),linear-gradient(180deg,#f8fafc_0%,#eff6ff_45%,#f8fafc_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          {usingFallback ? (
            <p className="text-sm text-amber-700">
              Some live workspace previews are temporarily unavailable. Showing bundled preview data.
            </p>
          ) : null}

          <Card className="overflow-hidden rounded-[32px] border-0 bg-white/85 shadow-2xl shadow-slate-200/50 backdrop-blur">
            <CardContent className="grid gap-8 p-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
              <div className="space-y-5">
                <Badge variant="outline" className="rounded-full border-slate-300 bg-slate-50 px-4 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-600">
                  Search-first legal workspace
                </Badge>
                <div className="space-y-2">
                  <h1 className="font-display text-5xl font-bold tracking-tight text-slate-950">
                    Hello {user?.full_name?.split(" ")[0] || "there"}.
                  </h1>
                  <p className="text-3xl text-slate-500">How can NyayaSetu help today?</p>
                </div>
                <div className="flex items-center gap-3 rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
                  <Search className="h-5 w-5 text-slate-400" />
                  <span className="text-base text-slate-500">
                    Ask about FIR drafting, tenant rights, cyber fraud, legal notices, or verified lawyers.
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {quickPrompts.slice(0, 4).map((prompt) => (
                    <Link
                      key={prompt}
                      to="/chat"
                      className="rounded-full border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white hover:text-slate-950"
                    >
                      {prompt}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-slate-50">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Mission</p>
                <p className="text-2xl font-semibold">Making legal access faster, transparent, and intelligent using AI.</p>
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    Citizens describe issues in simple language.
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    Police review structured complaints and FIR drafts.
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    Lawyers build trust through profiles and knowledge sharing.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Explore</p>
              <h2 className="font-display text-3xl font-bold text-slate-950">Platform surfaces built around legal outcomes</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {dashboardCards.map((card, index) => (
                <Link key={card.title} to={card.href}>
                  <Card className="h-full rounded-[28px] border-slate-200 bg-white/90 shadow-lg shadow-slate-200/40 transition hover:-translate-y-1 hover:shadow-xl">
                    <CardContent className="space-y-4 p-6">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        index % 3 === 0 ? "bg-slate-950 text-amber-200" : index % 3 === 1 ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"
                      }`}>
                        {index % 3 === 0 ? <Sparkles className="h-5 w-5" /> : index % 3 === 1 ? <BriefcaseBusiness className="h-5 w-5" /> : <Landmark className="h-5 w-5" />}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-slate-950">{card.title}</h3>
                        <p className="text-sm leading-7 text-slate-600">{card.description}</p>
                      </div>
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                        Open module <ArrowRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Card className="rounded-[30px] border-slate-200 bg-white/90 shadow-lg shadow-slate-200/40">
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Citizen legal assistant</p>
                    <p className="text-2xl font-semibold text-slate-950">Plain-language legal guidance with pathways to action</p>
                  </div>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-base leading-8 text-slate-700">
                  "My landlord is refusing to return my deposit. Show me the legal position, draft a complaint, and connect me with a verified property lawyer."
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">Possible legal provisions</div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">Suggested actions</div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">Draft complaint</div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">Recommended lawyers</div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[30px] border-slate-200 bg-slate-950 text-slate-50 shadow-xl shadow-slate-900/15">
              <CardContent className="space-y-5 p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Featured lawyers</p>
                {lawyers.map((lawyer) => (
                  <Link key={lawyer.handle} to={`/lawyer/${lawyer.handle}`} className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition hover:bg-white/10">
                    <p className="font-semibold">{lawyer.name}</p>
                    <p className="mt-1 text-sm text-slate-300">@{lawyer.handle} - {lawyer.specialization}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-400">{lawyer.city}</p>
                  </Link>
                ))}
                <Button asChild variant="outline" className="w-full rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10">
                  <Link to="/lawyers">Browse verified lawyers</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[30px] border-slate-200 bg-white/90 shadow-lg shadow-slate-200/40">
            <CardContent className="space-y-4 p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Try asking</p>
              {quickPrompts.map((prompt) => (
                <Link
                  key={prompt}
                  to="/chat"
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white hover:text-slate-950"
                >
                  {prompt}
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[30px] border-slate-200 bg-white/90 shadow-lg shadow-slate-200/40">
            <CardContent className="space-y-4 p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Police dashboard snapshot</p>
              {policeCards.slice(0, 3).map((card) => (
                <div key={card.title} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-950">{card.title}</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{card.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[30px] border-amber-200 bg-gradient-to-br from-amber-100 via-white to-amber-50 shadow-lg shadow-amber-100/60">
            <CardContent className="space-y-4 p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Pro tip</p>
              <p className="text-2xl font-semibold text-slate-950">
                Start with structured complaint intake, then branch into legal analysis, lawyer discovery, and police review.
              </p>
              <Button asChild className="w-full rounded-full bg-slate-950 text-amber-50 hover:bg-slate-900">
                <Link to="/fir">Open complaint workflow</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
