import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, PenSquare, UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";
import {
  fallbackLawyerDirectoryResponse,
  fallbackLawyerNetworkFeedResponse,
} from "@/lib/nyayasetu-data";
import {
  createLawyerNetworkPost,
  getLawyerNetworkFeed,
  getLawyers,
  toggleLawyerFollow,
  toggleLawyerPostLike,
  type LawyerNetworkPost,
  type LawyerSummary,
} from "@/services/api";

export default function LawyerNetworkPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<LawyerNetworkPost[]>(fallbackLawyerNetworkFeedResponse.posts);
  const [lawyers, setLawyers] = useState<LawyerSummary[]>(fallbackLawyerDirectoryResponse.lawyers);
  const [usingFallback, setUsingFallback] = useState(false);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

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

  async function handleLike(postId: number) {
    try {
      const result = await toggleLawyerPostLike(postId);
      setPosts((prev) => prev.map((post) => (
        post.id === postId
          ? {
              ...post,
              like_count: result.like_count,
              liked_by: result.liked_by,
              is_liked: result.liked,
              stats: `${result.like_count} likes | ${post.comment_count} comments`,
            }
          : post
      )));
    } catch (err: any) {
      toast({
        title: "Unable to like post",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    }
  }

  async function handleFollow(handle: string) {
    try {
      const result = await toggleLawyerFollow(handle);
      setLawyers((prev) => prev.map((lawyer) => (
        lawyer.handle === handle
          ? { ...lawyer, follower_count: result.follower_count }
          : lawyer
      )));
      toast({
        title: result.following ? "Lawyer followed" : "Lawyer unfollowed",
        description: `Follower count is now ${result.follower_count}.`,
      });
    } catch (err: any) {
      toast({
        title: "Unable to update follow",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    }
  }

  async function handlePublish() {
    if (!draft.trim()) {
      return;
    }
    try {
      setPosting(true);
      const created = await createLawyerNetworkPost({
        category: "Legal Insight",
        title: draft.trim().split(".")[0].slice(0, 120),
        excerpt: draft.trim().slice(0, 400),
        content: draft.trim(),
      });
      setPosts((prev) => [created, ...prev]);
      setDraft("");
      toast({
        title: "Post published",
        description: "Your network insight is now live.",
      });
    } catch (err: any) {
      toast({
        title: "Unable to publish",
        description: err?.message || "Please create or link a lawyer profile first.",
        variant: "destructive",
      });
    } finally {
      setPosting(false);
    }
  }

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
            {user?.role === "lawyer" ? (
              <Card className="rounded-[28px] border-slate-200 bg-white/95 shadow-lg shadow-slate-200/40">
                <CardContent className="space-y-4 p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Publish insight</p>
                  <Textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Share a practical legal insight, judgment note, or citizen-facing explainer."
                    className="min-h-[130px] resize-none"
                  />
                  <Button
                    type="button"
                    onClick={() => void handlePublish()}
                    disabled={posting || !draft.trim()}
                    className="rounded-full bg-slate-950 text-amber-50 hover:bg-slate-900"
                  >
                    {posting ? "Publishing..." : "Publish to network"}
                  </Button>
                </CardContent>
              </Card>
            ) : null}

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
                  {post.liked_by.length > 0 ? (
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      Liked by {post.liked_by.map((item) => item.name).join(", ")}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500">
                    <span>{post.stats}</span>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => void handleLike(post.id)}
                        className={`font-medium transition ${post.is_liked ? "text-slate-950" : "text-slate-700 hover:text-slate-950"}`}
                      >
                        {post.is_liked ? "Liked" : "Like"}
                      </button>
                      <button type="button" className="font-medium text-slate-700 transition hover:text-slate-950">Comment</button>
                      <button
                        type="button"
                        onClick={() => void handleFollow(post.handle)}
                        className="font-medium text-slate-700 transition hover:text-slate-950"
                      >
                        Follow lawyer
                      </button>
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
                    <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500">{lawyer.follower_count} followers</p>
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
