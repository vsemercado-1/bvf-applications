// Single source of truth for the application: the form, the Airtable fields,
// the reviewer views, and the prep page all read from this file.

export const REGIONS = [
  "Puerto Rico",
  "New York City metro area",
  "Miami metro area",
  "San Francisco Bay Area",
  "Other",
] as const;
export type Region = (typeof REGIONS)[number];

export const RAISING_OPTIONS = ["Raising now", "In the next 6 months", "Not right now"] as const;
export const TERMS_OPTIONS = ["Yes", "Let's discuss", "No"] as const;

export const STATUSES = [
  "Draft",
  "Submitted",
  "Screened out",
  "Not yet",
  "Finalist",
  "Interviewed",
  "Selected",
  "Declined",
] as const;
export type Status = (typeof STATUSES)[number];

export type FieldType = "text" | "email" | "url" | "textarea" | "select" | "radio";

export interface Field {
  key: string; // Airtable field name
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: readonly string[];
  maxLength?: number;
}

export interface Section {
  id: string;
  title: string;
  intro?: string;
  fields: Field[];
}

export const SECTIONS: Section[] = [
  {
    id: "applicant",
    title: "Applicant",
    fields: [
      { key: "Name", label: "Full name", type: "text", required: true },
      { key: "Email", label: "Email", type: "email", required: true },
      { key: "LinkedIn", label: "LinkedIn profile", type: "url", placeholder: "https://linkedin.com/in/…" },
      { key: "Role", label: "Your role at your company", type: "text", placeholder: "Founder & CEO", required: true },
      {
        key: "PR Connection",
        label: "Your connection to Puerto Rico",
        type: "text",
        required: true,
        help: "One sentence is enough.",
        placeholder: "Born in Ponce; moved to Miami at 12",
      },
    ],
  },
  {
    id: "company",
    title: "Company",
    fields: [
      { key: "Company", label: "Company name", type: "text", required: true },
      { key: "Website", label: "Website", type: "url", placeholder: "https://" },
      {
        key: "One-liner",
        label: "What does your company do?",
        type: "text",
        required: true,
        maxLength: 160,
        help: "One sentence.",
      },
      {
        key: "Why You",
        label: "Why you, and why this company?",
        type: "textarea",
        required: true,
        help: "What do you know about this problem that most people don't, and what have you already done about it?",
      },
      {
        key: "Traction",
        label: "Traction",
        type: "textarea",
        required: true,
        help: "Revenue, customers, pilots, LOIs, waitlist — whatever is true. Numbers are more useful than adjectives.",
      },
      {
        key: "Team",
        label: "Team",
        type: "text",
        required: true,
        placeholder: "2 full-time (CEO, CTO) + 1 contractor; based in San Juan and Miami",
        help: "How many people work on your company full time, and where are they?",
      },
      {
        key: "Competition",
        label: "Who else is solving this, and why do you win?",
        type: "text",
      },
    ],
  },
  {
    id: "financing",
    title: "Financing",
    intro: "Estimates are fine. This section helps the selection committee understand whether the Fellowship's investment would be meaningful for your company.",
    fields: [
      {
        key: "Total Raised",
        label: "Total capital raised to date",
        type: "text",
        required: true,
        placeholder: "$850K (grants + SAFEs)",
      },
      {
        key: "Last Round",
        label: "Most recent round",
        type: "text",
        required: true,
        placeholder: "$500K SAFE at $6M post-money cap, led by X, closed March 2026",
        help: "Instrument, amount, valuation or cap, lead investor, and date.",
      },
      {
        key: "Cash and Burn",
        label: "Cash on hand and monthly burn",
        type: "text",
        required: true,
        placeholder: "~$300K cash, ~$40K/month",
      },
      {
        key: "Raising",
        label: "Are you raising right now?",
        type: "radio",
        required: true,
        options: RAISING_OPTIONS,
      },
      {
        key: "Raise Details",
        label: "If so, how much and on what terms?",
        type: "text",
        placeholder: "$2M seed, targeting $12M post",
      },
      {
        key: "Terms OK",
        label:
          "The Fellowship invests $250,000 on a standard SAFE at the valuation cap of your most recent round, plus a small common-stock purchase. Would that work for you?",
        type: "radio",
        required: true,
        options: TERMS_OPTIONS,
      },
    ],
  },
  {
    id: "puerto-rico",
    title: "Puerto Rico",
    fields: [
      {
        key: "PR Impact",
        label: "What does your company do for Puerto Rico today, and what could it do over the next three years?",
        type: "textarea",
        required: true,
      },
      {
        key: "Fellowship Goals",
        label: "What would you want from the Fellowship beyond the investment?",
        type: "textarea",
        required: true,
      },
      { key: "Deck URL", label: "Pitch deck (link)", type: "url", placeholder: "Google Drive, DocSend, Notion…" },
      { key: "Demo URL", label: "Demo video (link)", type: "url", placeholder: "Loom, YouTube…" },
      {
        key: "Heard From",
        label: "How did you hear about the Fellowship?",
        type: "text",
        placeholder: "Orlando's post, a previous Fellow, Parallel18…",
      },
    ],
  },
];

export const ALL_FIELDS: Field[] = SECTIONS.flatMap((s) => s.fields);

// Fields set by the eligibility gate before the form starts.
export const GATE_FIELDS = ["Descent", "Region"] as const;

// Scorecard axes — the same five for screening and interviews.
export const SCORE_AXES = [
  {
    key: "PR Connection Score",
    label: "Puerto Rican connection",
    anchor: "5: specific, lived, unprompted · 1: thin or opportunistic",
  },
  {
    key: "Founder Fit Score",
    label: "Founder-market fit",
    anchor: "5: built this because they lived the problem · 1: saw a market report",
  },
  {
    key: "Demand Score",
    label: "Demand",
    anchor: "5: paying customers, growing · 3: signed LOIs or pilots · 1: idea",
  },
  {
    key: "Catalytic Score",
    label: "Catalytic capital",
    anchor: "5: $250K unlocks a round or a milestone · 1: immaterial",
  },
  {
    key: "PR Impact Score",
    label: "Puerto Rico impact within 12 months",
    anchor: "5: customers, hires, or deployments on the island this year · 1: someday",
  },
] as const;

export const RECOMMENDATIONS = ["Interview", "Not yet", "Pass"] as const;
export const DECISIONS = ["Select", "Decline", "Undecided"] as const;

export const LANES: Record<string, { title: string; goal: string; prompts: string[] }> = {
  strategy: {
    title: "Strategy & venture scale",
    goal: "Assess focus, ambition, and founder clarity.",
    prompts: [
      "What specific artifact exists after the $250K that does not exist today, and why is that sufficient to raise the next round?",
      "What is the one area you would not reduce spend on in the next six months, and why is that the bottleneck?",
      "Looking at the last 12 months, what assumption turned out to be wrong, and what did you change?",
      "Which customer type do you focus on first, and which do you deliberately deprioritize even if it would bring revenue sooner?",
    ],
  },
  impact: {
    title: "Puerto Rico & impact",
    goal: "Test authenticity and real-world applicability.",
    prompts: [
      "If one customer in Puerto Rico wants this today — who delivers it, who pays for it, and who helps if something breaks?",
      "Who in Puerto Rico benefits first, and how does it change their day-to-day?",
      "What is one concrete tradeoff you have already made between speed of growth and serving Puerto Rico?",
      "Beyond units or revenue, what metric would prove the company is helping the island?",
    ],
  },
  finance: {
    title: "Finance, capital & execution",
    goal: "Evaluate capital efficiency and financial discipline.",
    prompts: [
      "What is burn today, and what changed structurally since the last round?",
      "How many months of runway does this SAFE realistically buy, and what is the next financing inflection point?",
      "Walk us through how your existing SAFEs convert in a priced round. What does founder ownership look like after a reasonable next financing?",
      "Which customers or deals look good on paper but are hardest to support or least profitable in practice?",
    ],
  },
};
