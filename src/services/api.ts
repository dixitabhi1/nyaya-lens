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
