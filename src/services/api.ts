import { getAuthToken } from "@/lib/auth-storage";

const DEFAULT_API_BASE_URL = "https://abhishek785-nyaya-setu.hf.space/api/v1";
const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");
export const SWAGGER_URL =
  import.meta.env.VITE_SWAGGER_URL || BASE_URL.replace(/\/api\/v1$/i, "/docs");

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...options?.headers,
      },
    });
  } catch {
    throw new Error(
      "Unable to connect to the NyayaSetu API. Check the backend URL or try again shortly.",
    );
  }
  if (!res.ok) {
    if (res.status === 401) {
      try {
        const json = await res.json();
        const detail = json?.detail || "";
        if (path === "/auth/login") {
          throw new Error(
            "Invalid email or password. If you created your account before the latest backend redeploy, register again.",
          );
        }
        if (path === "/auth/me" || path === "/auth/logout") {
          throw new Error("Your session has expired. Please sign in again.");
        }
        throw new Error(detail || "Authentication failed. Please sign in again.");
      } catch (e: any) {
        if (e instanceof Error) throw e;
        throw new Error("Authentication failed. Please sign in again.");
      }
    }
    if (res.status === 422) {
      try {
        const json = await res.json();
        if (json?.detail && Array.isArray(json.detail)) {
          const messages = json.detail.map((d: any) => {
            const field = d.loc?.slice(1).join(".") || "unknown field";
            const label = field.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
            if (d.type === "missing" || d.type === "value_error.missing") return `${label} is required`;
            return d.msg ? `${label}: ${d.msg}` : `${label} is invalid`;
          });
          throw new Error(messages.join("\n"));
        }
        throw new Error(json?.detail || "Validation error: please check your inputs.");
      } catch (e: any) {
        if (e instanceof Error && !e.message.startsWith("API Error")) throw e;
        throw new Error("Validation error: please check your inputs.");
      }
    }
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return res.json();
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

function postForm<T>(path: string, formData: FormData): Promise<T> {
  return request<T>(path, { method: "POST", body: formData });
}

function get<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" });
}

function put<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "PUT", body: JSON.stringify(body) });
}

export type LawyerSummary = {
  handle: string;
  name: string;
  bar_council_id: string;
  years_of_practice: number;
  experience: string;
  specialization: string;
  courts: string;
  city: string;
  languages: string[];
  fee: string;
  rating: number;
  review_count: number;
  bio: string;
  verified: boolean;
  verification_status: string;
  public_url: string;
};

export type LawyerReview = {
  author: string;
  text: string;
  rating: number;
  created_at: string;
};

export type LawyerArticle = {
  category: string;
  title: string;
  excerpt: string;
  created_at: string;
};

export type LawyerDetail = LawyerSummary & {
  about: string;
  case_experience: string[];
  reviews: LawyerReview[];
  articles: LawyerArticle[];
  created_at: string;
  updated_at: string;
};

export type LawyerDirectoryResponse = {
  lawyers: LawyerSummary[];
  total_lawyers: number;
  average_rating: number;
  verified_percentage: number;
};

export type LawyerNetworkPost = {
  handle: string;
  author: string;
  category: string;
  title: string;
  excerpt: string;
  like_count: number;
  comment_count: number;
  stats: string;
  created_at: string;
};

export type LawyerNetworkFeedResponse = {
  posts: LawyerNetworkPost[];
};

export type LawyerRegistrationPayload = {
  handle: string;
  name: string;
  bar_council_id: string;
  years_of_practice: number;
  specialization: string;
  courts_practiced_in: string;
  city: string;
  languages: string[];
  consultation_fee: string;
  profile_photo_url?: string;
  bio: string;
  about?: string;
  case_experience: string[];
};

export type LawyerRegistrationResponse = {
  message: string;
  profile: LawyerDetail;
};

export type PoliceDashboardCard = {
  title: string;
  value: string;
  detail: string;
};

export type PoliceQueueItem = {
  fir_id: string;
  title: string;
  status: string;
  detail: string;
  workflow: string;
  police_station?: string | null;
  last_edited_at: string;
};

export type PoliceHotspotAlert = {
  title: string;
  detail: string;
};

export type PoliceDashboardResponse = {
  cards: PoliceDashboardCard[];
  queue: PoliceQueueItem[];
  hotspot_alerts: PoliceHotspotAlert[];
  generated_at: string;
};

// Auth
export const authRegister = (data: {
  email: string;
  full_name: string;
  password: string;
  role?: string;
}) => post<any>("/auth/register", data);

export const authLogin = (data: { email: string; password: string }) =>
  post<any>("/auth/login", data);

export const authMe = () => get<any>("/auth/me");

export const authLogout = () => post<any>("/auth/logout", {});
export const getHistory = (category?: string, limit = 20) =>
  get<any>(`/history?limit=${limit}${category ? `&category=${encodeURIComponent(category)}` : ""}`);

// Chat
export const chatQuery = (question: string, language = "en") =>
  post<any>("/chat/query", { question, language });

// Case Analysis
export const analyzeCase = (data: any) => post<any>("/analysis/case", data);

// Research
export const searchResearch = (data: any) => post<any>("/research/search", data);

// Document Drafting
export const draftDocument = (data: any) => post<any>("/analysis/draft", data);

// Contract Analysis
export const analyzeContract = (formData: FormData) =>
  postForm<any>("/documents/contract/analyze", formData);

// Evidence Analysis
export const analyzeEvidence = (formData: FormData) =>
  postForm<any>("/documents/evidence/analyze", formData);

// FIR
export const firManualPreview = (data: any) => post<any>("/fir/manual/preview", data);
export const firManualSubmit = (data: any) => post<any>("/fir/manual", data);
export const firUploadPreview = (formData: FormData) => postForm<any>("/fir/upload/preview", formData);
export const firUploadSubmit = (formData: FormData) => postForm<any>("/fir/upload", formData);
export const firVoicePreview = (formData: FormData) => postForm<any>("/fir/voice/preview", formData);
export const firVoiceSubmit = (formData: FormData) => postForm<any>("/fir/voice", formData);
export const firEvidenceAnalyze = (formData: FormData) => postForm<any>("/fir/evidence/analyze", formData);
export const firAddEvidence = (firId: string, formData: FormData) =>
  postForm<any>(`/fir/${firId}/evidence`, formData);
export const firUpdateDraft = (firId: string, data: any) => put<any>(`/fir/${firId}/draft`, data);
export const firGet = (firId: string) => get<any>(`/fir/${firId}`);
export const firVersions = (firId: string) => get<any>(`/fir/${firId}/versions`);
export const firIntelligence = (firId: string) => get<any>(`/fir/${firId}/intelligence`);
export const firAnalyticsPatterns = (days = 7) => get<any>(`/fir/analytics/patterns?window_days=${days}`);
export const firList = (limit = 25) => get<any>(`/fir?limit=${limit}`);

// Case Strength
export const predictStrength = (data: any) => post<any>("/analysis/strength", data);

export const getLawyers = (params?: {
  query?: string;
  city?: string;
  specialization?: string;
  minYears?: number;
  verifiedOnly?: boolean;
  limit?: number;
}) => {
  const search = new URLSearchParams();
  if (params?.query) search.set("query", params.query);
  if (params?.city) search.set("city", params.city);
  if (params?.specialization) search.set("specialization", params.specialization);
  if (typeof params?.minYears === "number") search.set("min_years", String(params.minYears));
  if (typeof params?.verifiedOnly === "boolean") search.set("verified_only", String(params.verifiedOnly));
  if (typeof params?.limit === "number") search.set("limit", String(params.limit));
  const suffix = search.toString() ? `?${search.toString()}` : "";
  return get<LawyerDirectoryResponse>(`/lawyers${suffix}`);
};

export const getLawyerProfile = (handle: string) =>
  get<LawyerDetail>(`/lawyers/${encodeURIComponent(handle.replace(/^@/, ""))}`);

export const getLawyerNetworkFeed = (limit = 20) =>
  get<LawyerNetworkFeedResponse>(`/lawyers/network/feed?limit=${limit}`);

export const registerLawyerProfile = (data: LawyerRegistrationPayload) =>
  post<LawyerRegistrationResponse>("/lawyers/register", data);

export const getPoliceDashboard = (limit = 8) =>
  get<PoliceDashboardResponse>(`/lawyers/police/dashboard?limit=${limit}`);
