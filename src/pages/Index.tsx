import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  FileSearch,
  Gavel,
  Landmark,
  Mic,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Scale,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import {
  citizenAssistantHighlights,
  fallbackLawyerDirectoryResponse,
  fallbackLawyerNetworkFeedResponse,
  fallbackPoliceDashboardResponse,
  featureCards,
  landingMetrics,
} from "@/lib/nyayasetu-data";
import {
  getLawyerNetworkFeed,
  getLawyers,
  getPoliceDashboard,
  type LawyerNetworkPost,
  type LawyerSummary,
  type PoliceDashboardCard,
} from "@/services/api";

const featureIcons = {
  complaint: Sparkles,
  "voice-fir": Mic,
  "case-analysis": FileSearch,
  ocr: Search,
  "crime-pattern": ShieldCheck,
  knowledge: BookOpenText,
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [lawyers, setLawyers] = useState<LawyerSummary[]>(fallbackLawyerDirectoryResponse.lawyers);
  const [posts, setPosts] = useState<LawyerNetworkPost[]>(fallbackLawyerNetworkFeedResponse.posts);
  const [policeCards, setPoliceCards] = useState<PoliceDashboardCard[]>(fallbackPoliceDashboardResponse.cards);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadLandingData() {
      try {
        const [directory, feed, police] = await Promise.all([
          getLawyers({ limit: 3 }),
          getLawyerNetworkFeed(3),
          getPoliceDashboard(4),
        ]);
        if (!active) {
          return;
        }
        setLawyers(directory.lawyers);
        setPosts(feed.posts);
        setPoliceCards(police.cards);
        setUsingFallback(false);
      } catch {
        if (!active) {
          return;
        }
        setLawyers(fallbackLawyerDirectoryResponse.lawyers);
        setPosts(fallbackLawyerNetworkFeedResponse.posts);
        setPoliceCards(fallbackPoliceDashboardResponse.cards);
        setUsingFallback(true);
      }
    }

    void loadLandingData();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(199,167,88,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.12),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_50%,#f8fafc_100%)]">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-amber-100 shadow-lg shadow-slate-950/15">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-xl font-bold leading-none text-slate-950">NyayaSetu</p>
              <p className="text-xs uppercase tracking-[0.32em] text-slate-500">AI legal bridge</p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
            <a href="#features" className="transition-colors hover:text-slate-950">Features</a>
            <a href="#lawyers" className="transition-colors hover:text-slate-950">Find Lawyers</a>
            <a href="#network" className="transition-colors hover:text-slate-950">Lawyer Network</a>
            <a href="#police" className="transition-colors hover:text-slate-950">Police Dashboard</a>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden text-slate-700 md:inline-flex">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild className="rounded-full bg-slate-950 px-5 text-amber-50 hover:bg-slate-900">
              <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                {isAuthenticated ? "Open Workspace" : "Get Started"}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {usingFallback ? (
          <div className="mx-auto max-w-7xl px-4 pt-6 text-sm text-amber-700 sm:px-6 lg:px-8">
            Some live marketplace and operations previews are temporarily unavailable. Showing bundled preview data.
          </div>
        ) : null}

        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_420px] lg:px-8 lg:py-24">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="outline" className="rounded-full border-slate-300 bg-white/70 px-4 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-600">
                India's AI-powered legal infrastructure
              </Badge>
              <h1 className="max-w-4xl font-display text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                NyayaSetu - AI Powered Legal Bridge for Citizens, Police and Lawyers
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                File complaints, analyze legal cases, connect with verified lawyers, and understand the law - all in one intelligent platform.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-slate-950 px-7 text-amber-50 hover:bg-slate-900">
                <Link to="/fir">File a Complaint</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-slate-300 bg-white/80 px-7 text-slate-800 hover:bg-slate-100">
                <Link to="/case-analysis">Analyze My Case</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-amber-300 bg-amber-50 px-7 text-slate-900 hover:bg-amber-100">
                <Link to="/lawyers">Find a Lawyer</Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {landingMetrics.map((metric) => (
                <Card key={metric.label} className="rounded-[28px] border-white/70 bg-white/70 shadow-xl shadow-slate-200/50 backdrop-blur">
                  <CardContent className="space-y-2 p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{metric.label}</p>
                    <p className="text-lg font-semibold text-slate-950">{metric.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="overflow-hidden rounded-[32px] border-slate-200/80 bg-slate-950 text-slate-50 shadow-2xl shadow-slate-900/20">
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center justify-between">
                  <Badge className="rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-slate-950">
                    Digital justice ecosystem
                  </Badge>
                  <span className="text-xs uppercase tracking-[0.26em] text-slate-400">Search-first platform</span>
                </div>

                <div className="space-y-3">
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Scales of justice</p>
                    <p className="mt-2 text-lg font-semibold">AI legal assistance, FIR quality, and evidence readiness</p>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Court columns</p>
                    <p className="mt-2 text-lg font-semibold">Citizens, police, and lawyers connected on one operating layer</p>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Law books</p>
                    <p className="mt-2 text-lg font-semibold">BNS, IPC, bare acts, judgments, and lawyer knowledge in one place</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[30px] border border-amber-200 bg-gradient-to-br from-amber-100 via-white to-slate-100 shadow-xl shadow-amber-100/60">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-950">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Citizen legal assistant</p>
                    <p className="text-xl font-semibold text-slate-950">"My landlord is refusing to return my deposit."</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {citizenAssistantHighlights.map((item) => (
                    <div key={item} className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge variant="outline" className="rounded-full border-slate-300 bg-white/80 px-4 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-600">
                Explore NyayaSetu
              </Badge>
              <h2 className="max-w-3xl font-display text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                AI-assisted complaint workflows, legal intelligence, and professional access.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              Inspired by modern legal-tech dashboards, the platform is designed around large search surfaces, guided workflows, and confident card-based navigation.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = featureIcons[feature.key as keyof typeof featureIcons];
              return (
                <Card
                  key={feature.key}
                  className={`overflow-hidden rounded-[30px] border-0 bg-gradient-to-br ${feature.gradient} text-white shadow-xl shadow-slate-200/60`}
                >
                  <CardContent className="space-y-6 p-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/18 backdrop-blur">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-body text-2xl font-bold leading-tight">{feature.title}</h3>
                      <p className="text-sm leading-7 text-white/86">{feature.description}</p>
                    </div>
                    <div className="space-y-2 text-sm text-white/88">
                      {feature.bullets.map((bullet) => (
                        <div key={bullet} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section id="lawyers" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <div className="space-y-3">
                <Badge variant="outline" className="rounded-full border-slate-300 bg-white/80 px-4 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-600">
                  Find Lawyers Marketplace
                </Badge>
                <h2 className="font-display text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                  Discover verified lawyers by specialization, city, experience, and trust signals.
                </h2>
                <p className="max-w-2xl text-base leading-7 text-slate-600">
                  NyayaSetu combines legal discovery with identity, handles, and knowledge visibility so citizens can find the right counsel faster.
                </p>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white/80 p-4 shadow-xl shadow-slate-200/50 backdrop-blur">
                <div className="flex flex-col gap-3 lg:flex-row">
                  <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-500">
                    <Search className="h-5 w-5" />
                    <span>Search by specialization, city, years of experience, or rating</span>
                  </div>
                  <Button asChild className="h-auto rounded-2xl bg-slate-950 px-6 py-4 text-amber-50 hover:bg-slate-900">
                    <Link to="/lawyers">Browse Lawyers</Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {lawyers.map((lawyer) => (
                  <Card key={lawyer.handle} className="rounded-[28px] border-slate-200 bg-white/85 shadow-xl shadow-slate-200/60">
                    <CardContent className="space-y-5 p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14 border border-slate-200">
                            <AvatarFallback className="bg-slate-950 text-base font-semibold text-amber-50">
                              {initials(lawyer.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-lg font-semibold text-slate-950">{lawyer.name}</p>
                            <p className="text-sm text-slate-500">@{lawyer.handle}</p>
                          </div>
                        </div>
                        <Badge className={lawyer.verified ? "rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "rounded-full bg-amber-100 text-amber-800 hover:bg-amber-100"}>
                          {lawyer.verified ? "Verified" : lawyer.verification_status}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-slate-600">
                        <p className="font-medium text-slate-900">{lawyer.specialization}</p>
                        <p>{lawyer.courts}</p>
                        <p>{lawyer.experience} experience</p>
                        <p>{lawyer.city}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-950">Rating {lawyer.rating.toFixed(1)}</span>
                        <span className="text-slate-500">{lawyer.fee}</span>
                      </div>
                      <Button asChild className="w-full rounded-full bg-slate-950 text-amber-50 hover:bg-slate-900">
                        <Link to={`/lawyer/${lawyer.handle}`}>Book Consultation</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <Card className="rounded-[30px] border-slate-200 bg-slate-950 text-slate-50 shadow-2xl shadow-slate-900/20">
                <CardContent className="space-y-5 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                      <Users className="h-5 w-5 text-amber-300" />
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Lawyer identity system</p>
                      <p className="text-2xl font-semibold">Public handles for discovery and reputation</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm text-slate-300">
                    <p>@adv_sharma</p>
                    <p>@criminal_law_singh</p>
                    <p>@justice_ananya</p>
                  </div>
                  <p className="text-sm leading-7 text-slate-300">
                    Handles power search, mentions in posts, public profile URLs, and trust building across the NyayaSetu network.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[30px] border-amber-200 bg-gradient-to-br from-amber-100 via-white to-amber-50 shadow-xl shadow-amber-100/60">
                <CardContent className="space-y-4 p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Lawyer self registration</p>
                  <p className="text-2xl font-semibold text-slate-950">Build your NyayaSetu profile and verification status</p>
                  <p className="text-sm leading-7 text-slate-600">
                    Lawyers can submit Bar Council ID, practice details, languages, city, consultation fee, bio, and photo to create a public profile.
                  </p>
                  <Button asChild className="w-full rounded-full bg-slate-950 text-amber-50 hover:bg-slate-900">
                    <Link to="/lawyers/join">Join as Lawyer</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="network" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <Card className="rounded-[30px] border-slate-200 bg-white/85 shadow-xl shadow-slate-200/50">
              <CardContent className="space-y-5 p-6">
                <Badge variant="outline" className="rounded-full border-slate-300 bg-slate-50 px-4 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-600">
                  NyayaSetu Lawyer Network
                </Badge>
                <p className="font-display text-4xl font-bold tracking-tight text-slate-950">
                  A professional legal knowledge feed built for trust.
                </p>
                <p className="text-sm leading-7 text-slate-600">
                  Lawyers publish insights, analyze judgments, answer citizen queries, and build reputation in a dedicated legal-tech social layer.
                </p>
                <Button asChild variant="outline" className="w-full rounded-full border-slate-300 bg-white hover:bg-slate-100">
                  <Link to="/lawyer-network">Open Lawyer Network</Link>
                </Button>
              </CardContent>
            </Card>

            <div className="grid gap-5 xl:grid-cols-3">
              {posts.map((post) => (
                <Card key={`${post.handle}-${post.title}`} className="rounded-[28px] border-slate-200 bg-white/90 shadow-xl shadow-slate-200/50">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{post.author}</p>
                        <p className="text-sm text-slate-500">@{post.handle}</p>
                      </div>
                      <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
                        {post.category}
                      </Badge>
                    </div>
                    <p className="text-xl font-semibold leading-tight text-slate-950">{post.title}</p>
                    <p className="text-sm leading-7 text-slate-600">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>{post.stats}</span>
                      <Link to={`/lawyer/${post.handle}`} className="font-semibold text-slate-900 hover:text-slate-700">
                        Follow lawyer
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_440px]">
            <Card className="rounded-[32px] border-slate-200 bg-slate-950 text-slate-50 shadow-2xl shadow-slate-900/15">
              <CardContent className="space-y-6 p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Gavel className="h-5 w-5 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Citizen legal assistant</p>
                    <p className="text-3xl font-semibold">Plain-language issues become structured legal next steps</p>
                  </div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-lg leading-8 text-slate-200">
                  "My landlord is refusing to return my deposit."
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {citizenAssistantHighlights.map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card id="police" className="rounded-[32px] border-slate-200 bg-white/90 shadow-xl shadow-slate-200/50">
              <CardContent className="space-y-5 p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-amber-200">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Police Dashboard</p>
                    <p className="text-3xl font-semibold text-slate-950">Reduce paperwork and improve FIR quality</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {policeCards.map((card) => (
                    <div key={card.title} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{card.title}</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">{card.value}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</p>
                    </div>
                  ))}
                </div>
                <Button asChild variant="outline" className="w-full rounded-full border-slate-300 bg-white hover:bg-slate-100">
                  <Link to="/police-dashboard">Open Police Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          <Card className="overflow-hidden rounded-[36px] border-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-slate-50 shadow-2xl shadow-slate-900/20">
            <CardContent className="grid gap-8 p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:p-10">
              <div className="space-y-4">
                <Badge className="w-fit rounded-full bg-amber-300 text-slate-950 hover:bg-amber-300">
                  Making legal access faster, transparent, and intelligent using AI
                </Badge>
                <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
                  Build justice infrastructure that connects citizens, police, and lawyers.
                </h2>
                <p className="max-w-3xl text-base leading-8 text-slate-300">
                  NyayaSetu brings together AI legal assistance, complaint drafting, lawyer discovery, legal networking, and police workflows in one modern legal-tech platform.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:flex-col">
                <Button asChild size="lg" className="rounded-full bg-amber-300 px-7 text-slate-950 hover:bg-amber-200">
                  <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                    Enter NyayaSetu <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 bg-white/5 px-7 text-white hover:bg-white/10">
                  <Link to="/lawyers">Explore lawyers</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Index;
