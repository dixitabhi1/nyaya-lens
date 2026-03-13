import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, PenSquare, UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  fallbackLawyerDirectoryResponse,
  fallbackLawyerNetworkFeedResponse,
} from "@/lib/nyayasetu-data";
import {
  getLawyerNetworkFeed,
  getLawyers,
  type LawyerNetworkPost,
  type LawyerSummary,
} from "@/services/api";

export default function LawyerNetworkPage() {
  const [posts, setPosts] = useState<LawyerNetworkPost[]>(fallbackLawyerNetworkFeedResponse.posts);
  const [lawyers, setLawyers] = useState<LawyerSummary[]>(fallbackLawyerDirectoryResponse.lawyers);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadNetwork() {
      try {
        const [feed, directory] = await Promise.all([
          getLawyerNetworkFeed(12),
          getLawyers({ limit: 6 }),
        ]);
        if (!active) {
          return;
        }
        setPosts(feed.posts);
        setLawyers(directory.lawyers);
        setUsingFallback(false);
      } catch {
        if (!active) {
          return;
        }
        setPosts(fallbackLawyerNetworkFeedResponse.posts);
        setLawyers(fallbackLawyerDirectoryResponse.lawyers);
        setUsingFallback(true);
      }
    }

    void loadNetwork();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_18%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {usingFallback ? (
          <p className="text-sm text-amber-700">
            Live lawyer-network data is temporarily unavailable. Showing bundled preview posts.
          </p>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="rounded-[32px] border-0 bg-slate-950 text-slate-50 shadow-2xl shadow-slate-900/20">
            <CardContent className="space-y-5 p-8">
              <Badge className="w-fit rounded-full bg-amber-300 text-slate-950 hover:bg-amber-300">
                NyayaSetu Lawyer Network
              </Badge>
              <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">
                A professional social platform for lawyers, insight, and trust.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-300">
                Publish legal insights, analyze judgments, answer citizen queries, and grow your public legal reputation through handles and verified profiles.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-full bg-amber-300 text-slate-950 hover:bg-amber-200">
                  <Link to="/lawyers/join">Create Lawyer Profile</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10">
                  <Link to="/lawyers">Browse Lawyers</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-slate-200 bg-white/90 shadow-xl shadow-slate-200/50">
            <CardContent className="space-y-4 p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">What lawyers can do</p>
              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <PenSquare className="h-5 w-5 text-slate-700" />
                    <span className="font-medium text-slate-950">Post legal insights and bare act explainers</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-slate-700" />
                    <span className="font-medium text-slate-950">Answer citizen questions and comment on trends</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <UserPlus className="h-5 w-5 text-slate-700" />
                    <span className="font-medium text-slate-950">Gain followers and consultation leads</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            {posts.map((post) => (
              <Card key={`${post.handle}-${post.title}`} className="rounded-[28px] border-slate-200 bg-white/95 shadow-lg shadow-slate-200/40">
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
                  <h2 className="text-2xl font-semibold leading-tight text-slate-950">{post.title}</h2>
                  <p className="text-sm leading-7 text-slate-600">{post.excerpt}</p>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500">
                    <span>{post.stats}</span>
                    <div className="flex gap-4">
                      <button type="button" className="font-medium text-slate-700 transition hover:text-slate-950">Like</button>
                      <button type="button" className="font-medium text-slate-700 transition hover:text-slate-950">Comment</button>
                      <Link to={`/lawyer/${post.handle}`} className="font-medium text-slate-700 transition hover:text-slate-950">
                        Follow lawyer
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-5">
            <Card className="rounded-[28px] border-slate-200 bg-white/95 shadow-lg shadow-slate-200/40">
              <CardContent className="space-y-4 p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Featured handles</p>
                {lawyers.map((lawyer) => (
                  <Link
                    key={lawyer.handle}
                    to={`/lawyer/${lawyer.handle}`}
                    className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white"
                  >
                    <p className="font-semibold text-slate-950">{lawyer.name}</p>
                    <p className="mt-1 text-sm text-slate-500">@{lawyer.handle} - {lawyer.specialization}</p>
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-amber-200 bg-gradient-to-br from-amber-100 via-white to-amber-50 shadow-lg shadow-amber-100/60">
              <CardContent className="space-y-4 p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Grow your reputation</p>
                <p className="text-2xl font-semibold text-slate-950">
                  Build a public handle, get verified, and publish legal articles that attract the right clients.
                </p>
                <Button asChild className="w-full rounded-full bg-slate-950 text-amber-50 hover:bg-slate-900">
                  <Link to="/lawyers/join">Join the network</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
