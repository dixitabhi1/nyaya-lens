import { useDeferredValue, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShieldCheck, Star, Users } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fallbackLawyerDirectoryResponse, fallbackLawyerSummaries } from "@/lib/nyayasetu-data";
import { getLawyers, type LawyerDirectoryResponse } from "@/services/api";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function buildFallbackDirectory(query: string): LawyerDirectoryResponse {
  const normalized = query.trim().toLowerCase();
  const lawyers = fallbackLawyerSummaries.filter((lawyer) => {
    if (!normalized) {
      return true;
    }

    const haystack = [
      lawyer.name,
      lawyer.handle,
      lawyer.specialization,
      lawyer.city,
      lawyer.courts,
      lawyer.experience,
      lawyer.languages.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });

  const averageRating = lawyers.length > 0 ? lawyers.reduce((sum, lawyer) => sum + lawyer.rating, 0) / lawyers.length : 0;
  const verifiedPercentage = lawyers.length > 0 ? Math.round((lawyers.filter((lawyer) => lawyer.verified).length / lawyers.length) * 100) : 0;

  return {
    lawyers,
    total_lawyers: lawyers.length,
    average_rating: averageRating,
    verified_percentage: verifiedPercentage,
  };
}

export default function LawyersPage() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [directory, setDirectory] = useState<LawyerDirectoryResponse>(fallbackLawyerDirectoryResponse);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadDirectory() {
      setLoading(true);
      try {
        const data = await getLawyers({
          query: deferredQuery.trim() || undefined,
          limit: 50,
        });
        if (!active) {
          return;
        }
        setDirectory(data);
        setUsingFallback(false);
      } catch {
        if (!active) {
          return;
        }
        setDirectory(buildFallbackDirectory(deferredQuery));
        setUsingFallback(true);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDirectory();
    return () => {
      active = false;
    };
  }, [deferredQuery]);

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="space-y-4 text-center">
          <Badge variant="outline" className="rounded-full border-slate-300 bg-white px-4 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-600">
            Verified legal professionals
          </Badge>
          <h1 className="font-display text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
            Find Your Legal Expert
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-8 text-slate-600">
            Browse verified lawyers, view their handles and profiles, compare practice areas, and book consultations.
          </p>
        </section>

        <Card className="rounded-[30px] border-slate-200 bg-white/95 shadow-xl shadow-slate-200/50">
          <CardContent className="space-y-5 p-6">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by name, specialization, city, years of experience, or handle"
                  className="w-full bg-transparent text-base text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>
              <Button type="button" className="h-auto rounded-[24px] bg-slate-950 px-8 py-4 text-amber-50 hover:bg-slate-900">
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>

            {usingFallback ? (
              <p className="text-sm text-amber-700">
                Live lawyer data is temporarily unavailable. Showing locally bundled preview profiles.
              </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{directory.total_lawyers} lawyers</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                <span>{directory.average_rating.toFixed(1)} avg rating</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>{directory.verified_percentage}% verified</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {directory.lawyers.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {directory.lawyers.map((lawyer) => (
              <Card key={lawyer.handle} className="rounded-[30px] border-slate-200 bg-white shadow-xl shadow-slate-200/40">
                <CardContent className="space-y-5 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border border-slate-200">
                        <AvatarFallback className="bg-slate-950 text-lg font-semibold text-amber-50">
                          {initials(lawyer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xl font-semibold text-slate-950">{lawyer.name}</p>
                        <p className="text-sm text-slate-500">@{lawyer.handle}</p>
                      </div>
                    </div>
                    <Badge className={lawyer.verified ? "rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "rounded-full bg-amber-100 text-amber-800 hover:bg-amber-100"}>
                      {lawyer.verified ? "Verified" : lawyer.verification_status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm leading-7 text-slate-600">
                    <p className="font-medium text-slate-900">{lawyer.specialization}</p>
                    <p>{lawyer.courts}</p>
                    <p>{lawyer.experience} experience</p>
                    <p>{lawyer.city}</p>
                    <p>{lawyer.languages.join(", ")}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                    <span className="font-semibold text-slate-950">Rating {lawyer.rating.toFixed(1)}</span>
                    <span className="text-slate-500">{lawyer.fee}</span>
                  </div>

                  <div className="flex gap-3">
                    <Button asChild className="flex-1 rounded-full bg-slate-950 text-amber-50 hover:bg-slate-900">
                      <Link to={`/lawyer/${lawyer.handle}`}>View Profile</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 rounded-full border-slate-300 bg-white hover:bg-slate-50">
                      <Link to={`/lawyer/${lawyer.handle}`}>Consult</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-[30px] border-slate-200 bg-white/95 shadow-xl shadow-slate-200/40">
            <CardContent className="flex flex-col items-center gap-4 px-6 py-14 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Users className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-semibold text-slate-950">No Lawyers Found</p>
                <p className="text-base text-slate-600">
                  Try a broader search or become the first verified lawyer in this niche.
                </p>
              </div>
              <Button asChild className="rounded-full bg-slate-950 text-amber-50 hover:bg-slate-900">
                <Link to="/lawyers/join">Join as Lawyer</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
