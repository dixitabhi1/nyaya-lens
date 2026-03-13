import type {
  LawyerDetail,
  LawyerDirectoryResponse,
  LawyerNetworkFeedResponse,
  LawyerSummary,
  PoliceDashboardResponse,
} from "@/services/api";

export type FeatureCard = {
  key: string;
  title: string;
  description: string;
  bullets: string[];
  gradient: string;
};

export type LawyerProfile = {
  handle: string;
  name: string;
  barCouncilId: string;
  experience: string;
  specialization: string;
  courts: string;
  city: string;
  languages: string[];
  fee: string;
  rating: number;
  bio: string;
  about: string;
  caseExperience: string[];
  reviews: { author: string; text: string; rating: number }[];
  articles: { title: string; excerpt: string }[];
  verified: boolean;
};

export type LawyerFeedPost = {
  handle: string;
  author: string;
  category: string;
  title: string;
  excerpt: string;
  stats: string;
};

export const landingMetrics = [
  { label: "AI complaint workflows", value: "FIR + OCR + RAG" },
  { label: "For institutions", value: "Police-ready dashboard" },
  { label: "Professional layer", value: "Verified lawyer network" },
];

export const featureCards: FeatureCard[] = [
  {
    key: "complaint",
    title: "AI Complaint Assistant",
    description: "Citizens explain an issue in plain language and NyayaSetu turns it into a structured complaint or FIR-ready narrative.",
    bullets: ["Simple-language intake", "Structured legal fields", "Draft-ready output"],
    gradient: "from-slate-900 via-slate-800 to-slate-700",
  },
  {
    key: "voice-fir",
    title: "Voice FIR Filing",
    description: "Narrate the complaint naturally and generate a structured FIR format ready for review or editing.",
    bullets: ["Speech-to-text", "Police station mapping", "Editable FIR format"],
    gradient: "from-amber-500 via-yellow-400 to-orange-300",
  },
  {
    key: "case-analysis",
    title: "Case Analysis Engine",
    description: "Upload facts or documents and get likely IPC or BNS sections, legal reasoning, charges, and next steps.",
    bullets: ["Possible sections", "Reasoning summary", "Action guidance"],
    gradient: "from-sky-500 via-indigo-400 to-blue-200",
  },
  {
    key: "ocr",
    title: "Complaint Upload with OCR",
    description: "Extract structured information from handwritten complaints, scans, and PDF uploads for faster intake.",
    bullets: ["OCR extraction", "PDF support", "Field normalization"],
    gradient: "from-emerald-500 via-teal-400 to-cyan-200",
  },
  {
    key: "crime-pattern",
    title: "Crime Pattern Detection",
    description: "Surface repeated crime patterns across location, category, and historical FIR records to identify hotspots.",
    bullets: ["Location clusters", "Historical signals", "Police alerts"],
    gradient: "from-rose-500 via-pink-400 to-orange-200",
  },
  {
    key: "knowledge",
    title: "Legal Knowledge Base",
    description: "Search bare acts and judgments, then explain Indian law in simple language with grounded legal context.",
    bullets: ["IPC, BNS, CrPC", "Judgment discovery", "Simple-language explanations"],
    gradient: "from-violet-500 via-fuchsia-400 to-purple-200",
  },
];

export const lawyerProfiles: LawyerProfile[] = [
  {
    handle: "adv_sharma",
    name: "Advocate Ananya Sharma",
    barCouncilId: "D/1234/2016",
    experience: "8 years",
    specialization: "Criminal Law",
    courts: "Delhi High Court, Tis Hazari Courts",
    city: "New Delhi",
    languages: ["English", "Hindi"],
    fee: "INR 2,500",
    rating: 4.9,
    bio: "Criminal law strategist focused on cyber fraud, bail hearings, and victim-oriented complaint workflows.",
    about: "Ananya works on complex criminal complaints, anticipatory bail strategy, and digital evidence review for citizens navigating early-stage police process.",
    caseExperience: [
      "Led pre-FIR advisory for cyber intimidation and extortion complaints.",
      "Represented clients in Delhi High Court bail and quashing matters.",
      "Advises startups and women-led founders on digital harassment response.",
    ],
    reviews: [
      { author: "Ritika M.", text: "Explained the complaint process clearly and helped us preserve evidence properly.", rating: 5 },
      { author: "Vikram S.", text: "Very strong on criminal drafting and practical next steps.", rating: 5 },
    ],
    articles: [
      { title: "How to preserve WhatsApp evidence before filing a complaint", excerpt: "A practical checklist for screenshots, exports, device metadata, and timeline capture." },
      { title: "When should a cyber intimidation complaint become an FIR request?", excerpt: "Understanding escalation points, urgency, and supporting materials." },
    ],
    verified: true,
  },
  {
    handle: "justice_rohan",
    name: "Advocate Rohan Mehta",
    barCouncilId: "MH/8841/2013",
    experience: "11 years",
    specialization: "Cyber Crime",
    courts: "Mumbai Sessions Court, Bombay High Court",
    city: "Mumbai",
    languages: ["English", "Hindi", "Marathi"],
    fee: "INR 3,000",
    rating: 4.8,
    bio: "Cybercrime litigator helping citizens and enterprises respond to phishing, OTP fraud, and digital extortion.",
    about: "Rohan focuses on financial cybercrime, device seizure readiness, and building strong documentary trails for investigation agencies.",
    caseExperience: [
      "Handled OTP theft and online banking fraud advisory matters.",
      "Supports e-evidence compilation and Section 65B readiness.",
      "Works with police teams on digital complaint triage.",
    ],
    reviews: [
      { author: "Anuj P.", text: "Excellent understanding of cyber evidence and bank complaint timelines.", rating: 5 },
      { author: "Megha R.", text: "Very practical and fast to respond in urgent fraud cases.", rating: 4 },
    ],
    articles: [
      { title: "What victims should preserve after OTP fraud", excerpt: "Beyond statements: preserve call records, device details, complaint IDs, and messaging trails." },
      { title: "Building a stronger cyber complaint with transaction metadata", excerpt: "How early evidence improves both police action and recovery chances." },
    ],
    verified: true,
  },
  {
    handle: "legal_saba",
    name: "Advocate Saba Khan",
    barCouncilId: "UP/4472/2018",
    experience: "6 years",
    specialization: "Family & Property",
    courts: "Lucknow Bench, District Civil Courts",
    city: "Lucknow",
    languages: ["English", "Hindi", "Urdu"],
    fee: "INR 1,800",
    rating: 4.7,
    bio: "Property and family law practitioner focused on plain-language legal access for citizens.",
    about: "Saba works on tenancy disputes, domestic relief strategy, and property possession issues with a strong emphasis on documentation and citizen education.",
    caseExperience: [
      "Assisted tenants with deposit recovery and legal notice strategy.",
      "Works on family settlement and maintenance matters.",
      "Known for citizen-friendly legal explainers and local court navigation.",
    ],
    reviews: [
      { author: "Farah A.", text: "Helped me understand my landlord dispute without jargon.", rating: 5 },
      { author: "Rohit K.", text: "Very professional and patient with documentation review.", rating: 4 },
    ],
    articles: [
      { title: "When should a tenant send a legal notice for deposit recovery?", excerpt: "How to move from negotiation to formal legal action with a clean paper trail." },
      { title: "Property dispute checklists citizens should maintain", excerpt: "An evidence-first guide for notices, possession, and civil filing readiness." },
    ],
    verified: true,
  },
];

export const lawyerFeedPosts: LawyerFeedPost[] = [
  {
    handle: "adv_sharma",
    author: "Advocate Ananya Sharma",
    category: "Judgment Insight",
    title: "How courts are reading digital evidence in early criminal proceedings",
    excerpt: "Screenshots alone rarely tell the full story. The stronger complaint bundles metadata, chronology, and source preservation right from the first filing.",
    stats: "128 likes | 24 comments",
  },
  {
    handle: "justice_rohan",
    author: "Advocate Rohan Mehta",
    category: "Citizen Q&A",
    title: "What should a victim preserve after OTP fraud?",
    excerpt: "Start with the call log, SMS alerts, device details, complaint number, and the exact timeline of disclosure and debit events.",
    stats: "94 likes | 17 comments",
  },
  {
    handle: "legal_saba",
    author: "Advocate Saba Khan",
    category: "Bare Act Thread",
    title: "Tenant deposit disputes: when should negotiation end and legal notice begin?",
    excerpt: "If the landlord is delaying beyond a documented timeline and refusing clear communication, preserve the trail and prepare a notice strategy early.",
    stats: "73 likes | 11 comments",
  },
];

export const quickPrompts = [
  "Draft a rental agreement for Lucknow",
  "Explain Section 498A IPC in simple language",
  "Create an NDA for my startup partnership",
  "Summarize a Supreme Court bail judgment",
  "What are tenant rights in India?",
  "Draft a complaint for OTP fraud",
];

export const citizenAssistantHighlights = [
  "Possible legal provisions",
  "Suggested actions",
  "Draft complaint",
  "Recommended lawyers",
];

export const policeDashboardCards = [
  {
    title: "Complaint Review Queue",
    value: "26 pending",
    detail: "OCR-normalized complaints waiting for station-level verification and FIR drafting support.",
  },
  {
    title: "Voice FIR Drafts",
    value: "11 generated",
    detail: "Citizen voice complaints converted into structured FIR drafts for review and refinement.",
  },
  {
    title: "Hotspot Signals",
    value: "3 active zones",
    detail: "Repeated theft and intimidation activity detected in the last 7 days.",
  },
  {
    title: "Case Tracking",
    value: "42 live",
    detail: "Cases tagged with evidence strength, jurisdiction readiness, and workflow status.",
  },
];

export const dashboardCards = [
  {
    title: "Draft Complaints",
    description: "Convert citizen issues into police-ready FIRs and structured legal complaints.",
    href: "/fir",
  },
  {
    title: "Analyze My Case",
    description: "Map facts to likely sections, legal reasoning, and next procedural steps.",
    href: "/case-analysis",
  },
  {
    title: "Find Lawyers",
    description: "Discover verified legal professionals by specialization, city, experience, and rating.",
    href: "/lawyers",
  },
  {
    title: "NyayaSetu Lawyer Network",
    description: "Follow lawyers, read judgment explainers, and discover trusted public handles.",
    href: "/lawyer-network",
  },
  {
    title: "Bare Acts & Judgments",
    description: "Search Indian law through a legal knowledge base grounded in statutes and case materials.",
    href: "/research",
  },
  {
    title: "Police Dashboard",
    description: "Track complaint quality, hotspot patterns, and investigation support tools.",
    href: "/police-dashboard",
  },
];

export function findLawyerByHandle(handle: string) {
  const normalized = handle.replace(/^@/, "").toLowerCase();
  return lawyerProfiles.find((lawyer) => lawyer.handle.toLowerCase() === normalized);
}

export const fallbackLawyerSummaries: LawyerSummary[] = lawyerProfiles.map((lawyer) => ({
  handle: lawyer.handle,
  name: lawyer.name,
  bar_council_id: lawyer.barCouncilId,
  years_of_practice: Number.parseInt(lawyer.experience, 10) || 0,
  experience: lawyer.experience,
  specialization: lawyer.specialization,
  courts: lawyer.courts,
  city: lawyer.city,
  languages: lawyer.languages,
  fee: lawyer.fee,
  rating: lawyer.rating,
  review_count: lawyer.reviews.length,
  bio: lawyer.bio,
  verified: lawyer.verified,
  verification_status: lawyer.verified ? "verified" : "pending",
  follower_count: 0,
  article_count: lawyer.articles.length,
  public_url: `nyayasetu.in/lawyer/@${lawyer.handle}`,
}));

export const fallbackLawyerDirectoryResponse: LawyerDirectoryResponse = {
  lawyers: fallbackLawyerSummaries,
  total_lawyers: fallbackLawyerSummaries.length,
  average_rating:
    fallbackLawyerSummaries.reduce((sum, lawyer) => sum + lawyer.rating, 0) / fallbackLawyerSummaries.length,
  verified_percentage: 100,
};

export const fallbackLawyerNetworkFeedResponse: LawyerNetworkFeedResponse = {
  posts: lawyerFeedPosts.map((post, index) => {
    const statsMatch = post.stats.match(/(\d+)\s+likes\s+\|\s+(\d+)\s+comments/i);
    return {
      id: index + 1,
      handle: post.handle,
      author: post.author,
      category: post.category,
      title: post.title,
      excerpt: post.excerpt,
      like_count: statsMatch ? Number.parseInt(statsMatch[1], 10) : 0,
      comment_count: statsMatch ? Number.parseInt(statsMatch[2], 10) : 0,
      stats: post.stats,
      liked_by: [],
      is_liked: false,
      public_url: `nyayasetu.in/lawyer/@${post.handle}`,
      created_at: new Date(2026, 0, 1).toISOString(),
    };
  }),
};

export function fallbackLawyerDetail(handle: string): LawyerDetail | undefined {
  const lawyer = findLawyerByHandle(handle);
  if (!lawyer) {
    return undefined;
  }

  return {
    handle: lawyer.handle,
    name: lawyer.name,
    bar_council_id: lawyer.barCouncilId,
    years_of_practice: Number.parseInt(lawyer.experience, 10) || 0,
    experience: lawyer.experience,
    specialization: lawyer.specialization,
    courts: lawyer.courts,
    city: lawyer.city,
    languages: lawyer.languages,
    fee: lawyer.fee,
    rating: lawyer.rating,
    review_count: lawyer.reviews.length,
    bio: lawyer.bio,
    verified: lawyer.verified,
    verification_status: lawyer.verified ? "verified" : "pending",
    follower_count: 0,
    article_count: lawyer.articles.length,
    public_url: `nyayasetu.in/lawyer/@${lawyer.handle}`,
    about: lawyer.about,
    case_experience: lawyer.caseExperience,
    reviews: lawyer.reviews.map((review) => ({
      author: review.author,
      text: review.text,
      rating: review.rating,
      created_at: new Date(2026, 0, 1).toISOString(),
    })),
    articles: lawyer.articles.map((article) => ({
      category: "Article",
      title: article.title,
      excerpt: article.excerpt,
      created_at: new Date(2026, 0, 1).toISOString(),
    })),
    followers: [],
    is_following: false,
    messaging_enabled: false,
    created_at: new Date(2026, 0, 1).toISOString(),
    updated_at: new Date(2026, 0, 1).toISOString(),
  };
}

export const fallbackPoliceDashboardResponse: PoliceDashboardResponse = {
  cards: policeDashboardCards,
  queue: [
    {
      fir_id: "preview-1",
      title: "Voice FIR - phone theft near market",
      status: "Ready For Review",
      detail: "Transcribed, section suggestions generated, and jurisdiction mapped to the local station.",
      workflow: "voice",
      police_station: "Hazratganj Police Station",
      last_edited_at: new Date(2026, 0, 1).toISOString(),
    },
    {
      fir_id: "preview-2",
      title: "Complaint upload - cyber intimidation",
      status: "Ocr Completed",
      detail: "Extracted complaint text, evidence trail, and chronology from uploaded scan.",
      workflow: "upload",
      police_station: "Cyber Crime Police Station",
      last_edited_at: new Date(2026, 0, 1).toISOString(),
    },
    {
      fir_id: "preview-3",
      title: "Manual complaint - trespass and damage",
      status: "Needs Evidence Review",
      detail: "Complaint drafted but missing strong documentary evidence and witness details.",
      workflow: "manual",
      police_station: "Lucknow Civil Lines Police Station",
      last_edited_at: new Date(2026, 0, 1).toISOString(),
    },
  ],
  hotspot_alerts: [
    {
      title: "Theft cluster - Hazratganj Market",
      detail: "Three theft incidents recorded near Hazratganj Market in the last 7 days.",
    },
    {
      title: "Cyber intimidation cluster",
      detail: "Repeated online intimidation complaints linked to a common neighborhood cluster.",
    },
    {
      title: "Property damage overlap",
      detail: "Property damage complaints show temporal overlap around one ward boundary.",
    },
  ],
  generated_at: new Date(2026, 0, 1).toISOString(),
};
