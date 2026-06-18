import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BellRing, Sparkles, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { getLawyerDashboard, type LawyerDashboardResponse } from "@/services/api";

export default function LawyerDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<LawyerDashboardResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const data = await getLawyerDashboard();
        if (!active) {
          return;
        }
        setDashboard(data);
        setError("");
      } catch (err: any) {
        if (!active) {
          return;
        }
        setError(err?.message || "Unable to load the judge dashboard right now.");
      }
    }

    void loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-full bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Card className="rounded-[28px] border-slate-200 bg-white shadow-xl shadow-slate-200/40">
            <CardContent className="space-y-4 p-8 text-center">
              <p className="font-display text-4xl font-bold text-slate-950">Judge dashboard unavailable</p>
              <p className="text-base text-slate-600">{error}</p>
              <Button asChild className="rounded-full bg-slate-950 text-amber-50 hover:bg-slate-900">
                <Link to="/register">Request judge access</Link>
              </Button>
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
              <p className="font-display text-4xl font-bold text-slate-950">Loading judge dashboard</p>
              <p className="text-base text-slate-600">Fetching profile signals, published insights, and court workflow metrics.</p>
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
                Judge control center
              </Badge>
              <h1 className="font-display text-5xl font-bold tracking-tight">
                Review court signals, monitor profile readiness, and move faster.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-300">
                {user?.full_name || "Your"} workspace reflects verified judge profile activity, published insights, and court-ready operational signals.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-full bg-amber-300 text-slate-950 hover:bg-amber-200">
                  <Link to="/dashboard">Open workspace</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10">
                  <Link to="/register">Request judge access</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-slate-200 bg-white/90 shadow-xl shadow-slate-200/50">
            <CardContent className="space-y-4 p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Live signals</p>
              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-slate-700" />
                    <span className="font-medium text-slate-950">{dashboard.recent_followers.length} recent profile watchers visible now</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <BellRing className="h-5 w-5 text-slate-700" />
                    <span className="font-medium text-slate-950">{dashboard.metrics.length} court workflow metrics loaded</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-slate-700" />
                    <span className="font-medium text-slate-950">{dashboard.top_posts.length} top-performing posts tracked</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {dashboard.metrics.map((metric) => (
            <Card key={metric.title} className="rounded-[28px] border-slate-200 bg-white shadow-lg shadow-slate-200/40">
              <CardContent className="space-y-3 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{metric.title}</p>
                <p className="text-4xl font-semibold text-slate-950">{metric.value}</p>
                <p className="text-sm leading-7 text-slate-600">{metric.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="rounded-[28px] border-slate-200 bg-white shadow-lg shadow-slate-200/40">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-slate-700" />
                <h2 className="text-2xl font-semibold text-slate-950">Profile watchers</h2>
              </div>
              <div className="space-y-3">
                {dashboard.recent_followers.length > 0 ? dashboard.recent_followers.map((follower) => (
                  <div key={`${follower.name}-${follower.followed_at}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="font-semibold text-slate-950">{follower.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{follower.role}</p>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
                    Profile watcher activity will appear here when approved users save this judge profile.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-slate-200 bg-white shadow-lg shadow-slate-200/40">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-slate-700" />
                <h2 className="text-2xl font-semibold text-slate-950">Top posts</h2>
              </div>
              <div className="space-y-4">
                {dashboard.top_posts.length > 0 ? dashboard.top_posts.map((post) => (
                  <div key={post.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-950">{post.title}</p>
                      <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
                        {post.like_count} likes
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{post.excerpt}</p>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
                    Published judicial insights will appear here once available.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
