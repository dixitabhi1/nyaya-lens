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
  follower_count: number;
  article_count: number;
  public_url: string;
};

export type LawyerSocialUser = {
  name: string;
  role: string;
};

export type LawyerFollower = LawyerSocialUser & {
  followed_at: string;
};

export type LawyerPostLike = LawyerSocialUser & {
  liked_at: string;
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
  followers: LawyerFollower[];
  is_following: boolean;
  messaging_enabled: boolean;
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
  id: number;
  handle: string;
  author: string;
  category: string;
  title: string;
  excerpt: string;
  like_count: number;
  comment_count: number;
  stats: string;
  liked_by: LawyerPostLike[];
  is_liked: boolean;
  public_url: string;
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

export type LawyerFollowersResponse = {
  handle: string;
  follower_count: number;
  followers: LawyerFollower[];
};

export type LawyerFollowToggleResponse = {
  handle: string;
  following: boolean;
  follower_count: number;
  followers: LawyerFollower[];
};

export type LawyerPostLikeToggleResponse = {
  post_id: number;
  liked: boolean;
  like_count: number;
  liked_by: LawyerPostLike[];
};

export type LawyerPostCreatePayload = {
  category: string;
  title: string;
  excerpt: string;
  content?: string;
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

export type LawyerDashboardMetric = {
  title: string;
  value: string;
  detail: string;
};

export type LawyerDashboardConversation = {
  conversation_id: number;
  counterpart_name: string;
  counterpart_role: string;
  preview: string;
  unread_count: number;
  last_message_at?: string | null;
};

export type LawyerDashboardResponse = {
  metrics: LawyerDashboardMetric[];
  recent_followers: LawyerFollower[];
  top_posts: LawyerNetworkPost[];
  recent_conversations: LawyerDashboardConversation[];
  generated_at: string;
};

export type PendingRoleApplicationLinkedProfile = {
  handle: string;
  verification_status: string;
  specialization: string;
  bar_council_id: string;
  city: string;
};

export type PendingRoleApplication = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  requested_role: string;
  approval_status: string;
  professional_id?: string | null;
  organization?: string | null;
  city?: string | null;
  preferred_language: string;
  approval_notes?: string | null;
  last_login_at?: string | null;
  linked_profile?: PendingRoleApplicationLinkedProfile | null;
  created_at: string;
};

export type PendingRoleApplicationsResponse = {
  applications: PendingRoleApplication[];
};

export type AdminMetric = {
  title: string;
  value: string;
  detail: string;
};

export type AdminLawyerProfileReview = {
  handle: string;
  name: string;
  verification_status: string;
  specialization: string;
  city: string;
  bar_council_id: string;
  linked_user_email?: string | null;
  created_at: string;
};

export type AdminFIRQueueItem = {
  fir_id: string;
  workflow: string;
  draft_role: string;
  status: string;
  complainant_name?: string | null;
  police_station?: string | null;
  incident_date?: string | null;
  incident_location?: string | null;
  last_edited_at: string;
};

export type AdminDashboardResponse = {
  metrics: AdminMetric[];
  pending_applications: PendingRoleApplication[];
  recent_lawyer_profiles: AdminLawyerProfileReview[];
  recent_firs: AdminFIRQueueItem[];
  generated_at: string;
};

export type MessageParticipant = {
  id: string;
  full_name: string;
  role: string;
  email: string;
  lawyer_handle?: string | null;
  lawyer_verified: boolean;
};

export type MessageUserDirectoryResponse = {
  users: MessageParticipant[];
};

export type DirectMessage = {
  id: number;
  conversation_id: number;
  sender: MessageParticipant;
  recipient: MessageParticipant;
  content: string;
  created_at: string;
  read_at?: string | null;
  is_mine: boolean;
};

export type ConversationSummary = {
  id: number;
  counterpart: MessageParticipant;
  last_message_preview?: string | null;
  last_message_at?: string | null;
  unread_count: number;
};

export type ConversationListResponse = {
  conversations: ConversationSummary[];
};

export type ConversationDetailResponse = {
  conversation: ConversationSummary;
  messages: DirectMessage[];
};

// Auth
export const authRegister = (data: {
  email: string;
  full_name: string;
  password: string;
  role?: string;
  professional_id?: string | null;
  organization?: string | null;
  city?: string | null;
  preferred_language?: string;
}) => post<any>("/auth/register", data);

export const authLogin = (data: { email: string; password: string }) =>
  post<any>("/auth/login", data);

export const authMe = () => get<any>("/auth/me");

export const authLogout = () => post<any>("/auth/logout", {});
export const getHistory = (category?: string, limit = 20) =>
  get<any>(`/history?limit=${limit}${category ? `&category=${encodeURIComponent(category)}` : ""}`);
export const getPendingRoleApprovals = () =>
  get<PendingRoleApplicationsResponse>("/auth/approvals");
export const updateRoleApproval = (userId: string, approval_status: "approved" | "rejected" | "pending", notes?: string) =>
  post<any>(`/auth/approvals/${encodeURIComponent(userId)}`, { approval_status, notes });

// Chat
export const chatQuery = (
  question: string,
  language = "en",
  history: Array<{ role: string; content: string }> = [],
) => post<any>("/chat/query", { question, language, history });

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
export async function downloadFirDocumentPdf(firId: string, documentKind: string, language?: string): Promise<Blob> {
  const token = getAuthToken();
  const suffix = language ? `?language=${encodeURIComponent(language)}` : "";
  const response = await fetch(
    `${BASE_URL}/fir/${encodeURIComponent(firId)}/documents/${encodeURIComponent(documentKind)}.pdf${suffix}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API Error ${response.status}: ${text}`);
  }
  return response.blob();
}

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

export const getLawyerFollowers = (handle: string, limit = 50) =>
  get<LawyerFollowersResponse>(`/lawyers/${encodeURIComponent(handle.replace(/^@/, ""))}/followers?limit=${limit}`);

export const toggleLawyerFollow = (handle: string) =>
  post<LawyerFollowToggleResponse>(`/lawyers/${encodeURIComponent(handle.replace(/^@/, ""))}/follow`, {});

export const toggleLawyerPostLike = (postId: number) =>
  post<LawyerPostLikeToggleResponse>(`/lawyers/network/posts/${postId}/like`, {});

export const createLawyerNetworkPost = (data: LawyerPostCreatePayload) =>
  post<LawyerNetworkPostResponse>("/lawyers/network/posts", data);

export const getLawyerDashboard = () =>
  get<LawyerDashboardResponse>("/lawyers/dashboard/me");

export const getAdminDashboard = (limit = 12) =>
  get<AdminDashboardResponse>(`/admin/dashboard?limit=${limit}`);

export const listMessageUsers = (query?: string, limit = 20) =>
  get<MessageUserDirectoryResponse>(
    `/messages/users?limit=${limit}${query ? `&query=${encodeURIComponent(query)}` : ""}`,
  );

export const listConversations = () =>
  get<ConversationListResponse>("/messages/conversations");

export const startConversation = (participantId: string) =>
  post<ConversationDetailResponse>("/messages/conversations", { participant_id: participantId });

export const startConversationWithLawyer = (handle: string) =>
  post<ConversationDetailResponse>(`/messages/lawyer/${encodeURIComponent(handle.replace(/^@/, ""))}`, {});

export const getConversation = (conversationId: number) =>
  get<ConversationDetailResponse>(`/messages/conversations/${conversationId}`);

export const sendConversationMessage = (conversationId: number, content: string) =>
  post<DirectMessage>(`/messages/conversations/${conversationId}/messages`, { content });

export function createMessagesWebSocket(token: string): WebSocket {
  const wsBase = BASE_URL.replace(/^http/i, (protocol) => (protocol.toLowerCase() === "https" ? "wss" : "ws"));
  return new WebSocket(`${wsBase}/messages/ws?token=${encodeURIComponent(token)}`);
}
