// Single source of truth for the application: the form, the Airtable fields,
// the reviewer views, and the prep page all read from this file.

export const REGIONS = [
  "Puerto Rico",
  "New York City",
  "Miami",
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

export type FieldType = "text" | "email" | "url" | "textarea" | "select" | "radio" | "image";

// Labels, help text and section titles may contain {first} and {company},
// which are filled in with the applicant's first name and company name.
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
  short: string; // progress label
  title: string;
  intro?: string;
  fields: Field[];
}

export interface Ctx {
  first: string;
  company: string;
}

export function fill(template: string, ctx: Ctx): string {
  return template
    .replace(/\{CompanyLabel\}/g, ctx.company || "Company")
    .replace(/\{first\}/g, ctx.first || "you")
    .replace(/\{First\}/g, ctx.first || "You")
    .replace(/\{company\}/g, ctx.company || "your company")
    .replace(/\{company's\}/g, ctx.company ? `${ctx.company}'s` : "your company's");
}

export function ctxFrom(values: Record<string, string | undefined>): Ctx {
  const name = (values["Name"] || "").trim();
  return { first: name.split(/\s+/)[0] || "", company: (values["Company"] || "").trim() };
}

export const SECTIONS: Section[] = [
  {
    id: "you",
    short: "You",
    title: "Let's start with you.",
    intro: "Some basic information first. The rest of the application is about your company.",
    fields: [
      { key: "Name", label: "Your full name", type: "text", required: true, placeholder: "First and last name" },
      { key: "Email", label: "Your email address", type: "email", required: true },
      { key: "LinkedIn", label: "Link to your LinkedIn profile", type: "url", required: true, placeholder: "https://linkedin.com/in/…" },
      { key: "Headshot", label: "A photo of you", type: "image", help: "Optional. It helps the selection committee remember who you are." },
      { key: "Company", label: "The name of your company", type: "text", required: true },
      { key: "Website", label: "Your company's website", type: "url", placeholder: "https://" },
      { key: "Role", label: "Your title at {company}", type: "text", placeholder: "Founder & CEO", required: true },
      {
        key: "PR Connection",
        label: "How are you connected to Puerto Rico?",
        type: "text",
        required: true,
        help: "For example: where you or your family are from, or where you grew up. One sentence is enough.",
        placeholder: "Born in Ponce; moved to Miami at 12",
      },
    ],
  },
  {
    id: "company",
    short: "{CompanyLabel}",
    title: "{First}, tell us about {company}.",
    fields: [
      {
        key: "One-liner",
        label: "What does {company} do?",
        type: "text",
        required: true,
        maxLength: 160,
        help: "Describe the product or service in one sentence, and who it is for.",
      },
      {
        key: "Why You",
        label: "Why are you the right person to build {company}?",
        type: "textarea",
        required: true,
        help: "Tell us about your background and why you started this company. What experience do you have with this problem? What have you already built or learned?",
      },
      {
        key: "Traction",
        label: "What progress has {company} made so far?",
        type: "textarea",
        required: true,
        help: "Share your results with numbers where you can: revenue, number of customers, pilots, signed letters of intent, users, or growth. Whatever is true for your company today.",
      },
      {
        key: "Team",
        label: "Who works at {company}?",
        type: "text",
        required: true,
        placeholder: "2 full-time (CEO, CTO) + 1 contractor; based in San Juan and Miami",
        help: "How many people work at the company full time, what are their roles, and where are they located?",
      },
      {
        key: "Competition",
        label: "Who are {company's} main competitors, and what makes {company} different?",
        type: "textarea",
        required: true,
        help: "Name the companies or products that customers might choose instead of yours, and explain why they would choose you.",
      },
    ],
  },
  {
    id: "financing",
    short: "Financing",
    title: "{company's} financing.",
    intro: "Approximate numbers are fine, {first}. This section helps the selection committee understand whether the Fellowship's $250,000 investment would make a real difference for {company}.",
    fields: [
      {
        key: "Total Raised",
        label: "How much money has {company} raised from investors so far, in total?",
        type: "text",
        required: true,
        placeholder: "$850K (grants + SAFEs)",
        help: "Include all funding: grants, SAFEs, convertible notes, and priced rounds. If none, write $0.",
      },
      {
        key: "Last Round",
        label: "Describe {company's} most recent funding round",
        type: "text",
        required: true,
        placeholder: "$500K SAFE at $6M post-money cap, led by X, closed March 2026",
        help: "The type of investment (SAFE, note, or priced round), the amount, the valuation or cap, the lead investor, and when it closed. If you have not raised yet, write \"none\".",
      },
      {
        key: "Cash and Burn",
        label: "How much cash does {company} have now, and how much does it spend per month?",
        type: "text",
        required: true,
        placeholder: "~$300K cash, ~$40K/month",
        help: "Your current bank balance and your average monthly expenses. Approximate is fine.",
      },
      {
        key: "Raising",
        label: "Is {company} currently raising money from investors?",
        type: "radio",
        required: true,
        options: RAISING_OPTIONS,
      },
      {
        key: "Raise Details",
        label: "If you are raising now or soon, how much are you raising, and at what valuation?",
        type: "text",
        placeholder: "$2M seed, targeting $12M post",
      },
      {
        key: "Terms OK",
        label:
          "The Fellowship invests $250,000 using a standard SAFE, at the same valuation cap as {company's} most recent round, plus a small purchase of common stock. Would you accept an investment on those terms?",
        type: "radio",
        required: true,
        options: TERMS_OPTIONS,
        help: "\"Let's discuss\" is a fine answer. We ask now so there are no surprises later.",
      },
    ],
  },
  {
    id: "puerto-rico",
    short: "Puerto Rico",
    title: "{company} and Puerto Rico.",
    fields: [
      {
        key: "PR Impact",
        label: "How does {company} benefit Puerto Rico today, and how could it benefit Puerto Rico over the next three years?",
        type: "textarea",
        required: true,
        help: "For example: customers, jobs, suppliers, or operations on the island. Be specific about what exists now and what you plan to do.",
      },
      {
        key: "Fellowship Goals",
        label: "{First}, besides the $250,000 investment, what kind of help would be most useful to you from the Fellowship?",
        type: "textarea",
        required: true,
        help: "For example: introductions to investors, help with fundraising, press and marketing, hiring, or advice on a specific problem.",
      },
      { key: "Deck URL", label: "Link to your pitch deck", type: "url", placeholder: "Google Drive, DocSend, Notion…", help: "Make sure the link can be opened by anyone who has it." },
      { key: "Demo URL", label: "Link to a demo video of your product", type: "url", placeholder: "Loom, YouTube…" },
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
