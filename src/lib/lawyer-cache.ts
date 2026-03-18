import type { LawyerDetail, LawyerDirectoryResponse, LawyerSummary } from "@/services/api";

const LAWYER_CACHE_KEY = "nyayasetu_lawyer_profile_cache";

type LawyerCacheRecord = Record<string, LawyerDetail>;

function readCache(): LawyerCacheRecord {
  const raw = localStorage.getItem(LAWYER_CACHE_KEY);
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as LawyerCacheRecord;
  } catch {
    return {};
  }
}

function writeCache(cache: LawyerCacheRecord): void {
  localStorage.setItem(LAWYER_CACHE_KEY, JSON.stringify(cache));
}

function normalizeHandle(handle: string): string {
  return handle.replace(/^@/, "").trim().toLowerCase();
}

function toSummary(profile: LawyerDetail): LawyerSummary {
  return {
    handle: profile.handle,
    name: profile.name,
    bar_council_id: profile.bar_council_id,
    years_of_practice: profile.years_of_practice,
    experience: profile.experience,
    specialization: profile.specialization,
    courts: profile.courts,
    city: profile.city,
    languages: profile.languages,
    fee: profile.fee,
    rating: profile.rating,
    review_count: profile.review_count,
    bio: profile.bio,
    verified: profile.verified,
    verification_status: profile.verification_status,
    follower_count: profile.follower_count,
    article_count: profile.article_count,
    public_url: profile.public_url,
  };
}

export function getCachedLawyerProfile(handle: string): LawyerDetail | null {
  const cache = readCache();
  return cache[normalizeHandle(handle)] ?? null;
}

export function upsertCachedLawyerProfile(profile: LawyerDetail): void {
  const cache = readCache();
  cache[normalizeHandle(profile.handle)] = profile;
  writeCache(cache);
}

export function mergeLawyerDirectoryWithCache(directory: LawyerDirectoryResponse): LawyerDirectoryResponse {
  const cache = readCache();
  const summaries = Object.values(cache)
    .sort((left, right) => right.updated_at.localeCompare(left.updated_at))
    .map(toSummary);
  const merged = new Map<string, LawyerSummary>();

  for (const lawyer of summaries) {
    merged.set(normalizeHandle(lawyer.handle), lawyer);
  }
  for (const lawyer of directory.lawyers) {
    merged.set(normalizeHandle(lawyer.handle), lawyer);
  }

  const lawyers = Array.from(merged.values());
  const averageRating =
    lawyers.length > 0 ? lawyers.reduce((sum, lawyer) => sum + lawyer.rating, 0) / lawyers.length : 0;
  const verifiedPercentage =
    lawyers.length > 0
      ? Math.round((lawyers.filter((lawyer) => lawyer.verified).length / lawyers.length) * 100)
      : 0;

  return {
    lawyers,
    total_lawyers: lawyers.length,
    average_rating: averageRating,
    verified_percentage: verifiedPercentage,
  };
}
