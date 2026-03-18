import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { BadgeCheck, BookOpenText, MessageSquare, Star, Users } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useInbox } from "@/lib/inbox-context";
import { getCachedLawyerProfile, upsertCachedLawyerProfile } from "@/lib/lawyer-cache";
import { fallbackLawyerDetail } from "@/lib/nyayasetu-data";
import {
  getLawyerProfile,
  toggleLawyerFollow,
  type LawyerDetail,
} from "@/services/api";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function LawyerProfilePage() {
  const { handle = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startConversationWithLawyerHandle } = useInbox();
  const { toast } = useToast();
  const initialProfile =
    (location.state as { initialProfile?: LawyerDetail } | null)?.initialProfile ??
    getCachedLawyerProfile(handle);
  const [lawyer, setLawyer] = useState<LawyerDetail | null>(initialProfile ?? null);
  const [loading, setLoading] = useState(!initialProfile);
  const [usingFallback, setUsingFallback] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const cachedProfile =
      (location.state as { initialProfile?: LawyerDetail } | null)?.initialProfile ??
      getCachedLawyerProfile(handle);
    if (cachedProfile) {
      setLawyer(cachedProfile);
      setLoading(false);
    }
  }, [handle, location.state]);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      try {
        const profile = await getLawyerProfile(handle);
        if (!active) {
          return;
        }
        setLawyer(profile);
        upsertCachedLawyerProfile(profile);
        setUsingFallback(false);
      } catch {
        if (!active) {
          return;
        }
        setLawyer(fallbackLawyerDetail(handle) ?? null);
        setUsingFallback(true);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, [handle]);

  async function handleFollow() {
    if (!lawyer) {
      return;
    }
    try {
      setFollowLoading(true);
      const result = await toggleLawyerFollow(lawyer.handle);
      setLawyer((prev) => {
        if (!prev) {
          return prev;
        }
        const next = {
          ...prev,
          is_following: result.following,
          follower_count: result.follower_count,
          followers: result.followers,
        };
        upsertCachedLawyerProfile(next);
        return next;
      });
    } catch (err: any) {
      toast({
        title: "Unable to update follow state",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setFollowLoading(false);
    }
  }

  async function handleMessage() {
    if (!lawyer) {
      return;
    }
    try {
      const detail = await startConversationWithLawyerHandle(lawyer.handle);
      navigate(`/messages?conversation=${detail.conversation.id}`);
    } catch (err: any) {
      toast({
        title: "Unable to start chat",
        description: err?.message || "Please try again later.",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="min-h-full bg-background px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="rounded-[28px] border-slate-200 bg-white/95 shadow-xl shadow-slate-200/40">
            <CardContent className="space-y-4 p-8 text-center">
              <p className="font-display text-4xl font-bold text-slate-950">Loading lawyer profile</p>
              <p className="text-base text-slate-600">Fetching handle details, reviews, and articles.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="min-h-full bg-background px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="rounded-[28px] border-slate-200 bg-white/95 shadow-xl shadow-slate-200/40">
            <CardContent className="space-y-4 p-8 text-center">
              <p className="font-display text-4xl font-bold text-slate-950">Lawyer profile not found</p>
              <p className="text-base text-slate-600">This handle does not exist yet or the profile has not been published.</p>
              <Button asChild className="rounded-full bg-slate-950 text-amber-50 hover:bg-slate-900">
                <Link to="/lawyers">Back to lawyers</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {usingFallback ? (
          <p className="text-sm text-amber-700">
            Live lawyer profile data is temporarily unavailable. Showing bundled preview content.
          </p>
        ) : null}

        <Card className="overflow-hidden rounded-[32px] border-0 bg-slate-950 text-slate-50 shadow-2xl shadow-slate-900/20">
          <CardContent className="grid gap-6 p-8 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
            <Avatar className="h-24 w-24 border border-white/15">
              <AvatarFallback className="bg-amber-300 text-3xl font-bold text-slate-950">
                {initials(lawyer.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-5xl font-bold">{lawyer.name}</h1>
                <Badge className={lawyer.verified ? "rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "rounded-full bg-amber-100 text-amber-800 hover:bg-amber-100"}>
                  {lawyer.verified ? <><BadgeCheck className="mr-1 h-4 w-4" /> Verified</> : lawyer.verification_status}
                </Badge>
              </div>
              <p className="text-lg text-slate-300">@{lawyer.handle}</p>
              <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                <span>{lawyer.experience} experience</span>
                <span>{lawyer.specialization}</span>
                <span>{lawyer.city}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button className="rounded-full bg-amber-300 text-slate-950 hover:bg-amber-200">Book Consultation</Button>
              <Button
                type="button"
                onClick={() => void handleMessage()}
                disabled={!lawyer.messaging_enabled}
                variant="outline"
                className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                {lawyer.messaging_enabled ? "Send Message" : "Messaging Unlocks After Account Link"}
              </Button>
              {user ? (
                <Button
                  type="button"
                  onClick={() => void handleFollow()}
                  disabled={followLoading}
                  className="rounded-full bg-white text-slate-950 hover:bg-slate-100"
                >
                  {lawyer.is_following ? "Following" : "Follow Lawyer"}
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <Card className="rounded-[28px] border-slate-200 bg-white shadow-lg shadow-slate-200/40">
              <CardContent className="space-y-4 p-6">
                <h2 className="text-2xl font-semibold text-slate-950">About</h2>
                <p className="text-sm leading-7 text-slate-600">{lawyer.about}</p>
                <p className="text-sm leading-7 text-slate-600">{lawyer.bio}</p>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-slate-200 bg-white shadow-lg shadow-slate-200/40">
              <CardContent className="space-y-4 p-6">
                <h2 className="text-2xl font-semibold text-slate-950">Case Experience</h2>
                <div className="space-y-3">
                  {lawyer.case_experience.length > 0 ? lawyer.case_experience.map((item) => (
                    <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
                      {item}
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
                      Case experience will appear after verification and publishing.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-slate-200 bg-white shadow-lg shadow-slate-200/40">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <BookOpenText className="h-5 w-5 text-slate-700" />
                  <h2 className="text-2xl font-semibold text-slate-950">Legal Articles</h2>
                </div>
                <div className="space-y-4">
                  {lawyer.articles.length > 0 ? lawyer.articles.map((article) => (
                    <div key={article.title} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="text-lg font-semibold text-slate-950">{article.title}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{article.excerpt}</p>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
                      Articles will appear here once the lawyer starts publishing on the network.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-[28px] border-slate-200 bg-white shadow-lg shadow-slate-200/40">
              <CardContent className="space-y-4 p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Professional details</p>
                <div className="space-y-3 text-sm leading-7 text-slate-600">
                  <div><span className="font-semibold text-slate-950">Bar Council ID:</span> {lawyer.bar_council_id}</div>
                  <div><span className="font-semibold text-slate-950">Courts:</span> {lawyer.courts}</div>
                  <div><span className="font-semibold text-slate-950">Languages:</span> {lawyer.languages.join(", ")}</div>
                  <div><span className="font-semibold text-slate-950">Consultation:</span> {lawyer.fee}</div>
                  <div><span className="font-semibold text-slate-950">Followers:</span> {lawyer.follower_count}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-slate-200 bg-white shadow-lg shadow-slate-200/40">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-amber-500" />
                  <h2 className="text-2xl font-semibold text-slate-950">Client Reviews</h2>
                </div>
                <div className="space-y-4">
                  {lawyer.reviews.length > 0 ? lawyer.reviews.map((review, index) => (
                    <div key={`${review.author}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-950">{review.author}</p>
                        <span className="text-sm text-slate-500">Rating {review.rating}/5</span>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{review.text}</p>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
                      Reviews will appear once consultations begin.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-amber-200 bg-gradient-to-br from-amber-100 via-white to-amber-50 shadow-lg shadow-amber-100/60">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-slate-700" />
                  <h2 className="text-2xl font-semibold text-slate-950">Public handle</h2>
                </div>
                <p className="text-sm leading-7 text-slate-700">Profile URL: {lawyer.public_url}</p>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-slate-200 bg-white shadow-lg shadow-slate-200/40">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-slate-700" />
                  <h2 className="text-2xl font-semibold text-slate-950">Followers</h2>
                </div>
                <div className="space-y-3">
                  {lawyer.followers.length > 0 ? lawyer.followers.map((follower) => (
                    <div key={`${follower.name}-${follower.followed_at}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="font-semibold text-slate-950">{follower.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{follower.role}</p>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
                      Follower activity will appear here as citizens, police officers, and lawyers follow this profile.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
