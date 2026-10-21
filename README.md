# Bravo Venture Fellowship — 2027 Application

A Next.js site with three parts:

1. **Public application** (`/`) — landing page, eligibility check, four-step application with autosave and a private resume link, nomination form, and a finalist materials page.
2. **Home: Screen, then Decide** (`/review`) — the screening reviewers score each application privately. Once both have finished, the same page becomes Decide: scores side by side, and a per-row **Invite to interview** button (immediate, undoable). **Finish deciding** marks the rest Not selected and closes applications.
3. **Interviews** (`/review/interviews`) — one page per finalist with a quick summary, their materials, the three question lanes, shared prep notes, and live scoring that all three reviewers see as it is entered.

All data lives in Airtable. The site has no database of its own.

---

## 1. The Airtable base

**The base already exists: "BVF 2027 Applications" (`app6wXbILaYobWhzL`) in your Airtable workspace, with every table and field the app uses.** You do not need to run the setup script unless you want a fresh copy.

For the app to read and write it, create a personal access token (Airtable → Account → Developer hub → Personal access tokens) with scopes `data.records:read`, `data.records:write`, `schema.bases:read`, and give it access to that base. That token is `AIRTABLE_TOKEN`.

To create a fresh base instead, you need a personal access token (Airtable → Account → Developer hub → Personal access tokens) with these scopes: `data.records:read`, `data.records:write`, `schema.bases:read`, `schema.bases:write`. Give it access to the workspace where the base should live.

Then, from this folder:

```bash
npm install
AIRTABLE_TOKEN=pat_xxx AIRTABLE_WORKSPACE_ID=wsp_xxx npm run setup:airtable
```

(Your workspace ID is in the URL when you open a workspace in Airtable; it starts with `wsp`.)

The script creates a base called **BVF 2027 Applications** with three tables — Applications, Reviews, Nominations — and prints the base ID. You only run this once.

If you'd rather build the base by hand or in an existing base, the exact field names are in `scripts/setup-airtable.mjs`. The app looks fields up by name, so the names must match.

## 2. Set the environment variables

Copy `.env.example` to `.env.local` and fill it in:

| Variable | What it is |
| --- | --- |
| `AIRTABLE_TOKEN` | The token from step 1 (schema scopes no longer needed after setup). |
| `AIRTABLE_BASE_ID` | Printed by the setup script. Starts with `app`. |
| `REVIEWERS` | JSON list of the three reviewers with email, password, and lane. |
| `SESSION_SECRET` | Any long random string. `openssl rand -base64 32` works. |
| `NEXT_PUBLIC_SITE_URL` | The public URL, used in emails and resume links. |
| `NEXT_PUBLIC_DEADLINE` | Application close date, e.g. `2027-01-15`. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Shown in the footer. |

Run locally with `npm run dev` and open http://localhost:3000.

## 3. Put it on GitHub and Vercel

1. Open **GitHub Desktop** → File → Add Local Repository → choose this folder. Commit everything and click **Publish repository** (private is fine).
2. Go to [vercel.com/new](https://vercel.com/new), import the repository. Vercel detects Next.js; no settings to change.
3. In the import screen (or later under Project → Settings → Environment Variables), paste every variable from `.env.local`. `REVIEWERS` is a single line of JSON.
4. Deploy. Add your custom domain under Project → Settings → Domains, and set `NEXT_PUBLIC_SITE_URL` to match.

Every later change: commit in GitHub Desktop, push, and Vercel redeploys automatically.

---

## How the process works in the app

**Applicants** answer the two gate questions (descent, region). An ineligible answer goes to a polite page with the nomination form. Eligible applicants go through four sections — Applicant, Company, Financing, Puerto Rico — with autosave every few seconds. Answers are kept in their browser, and after step 1 they get a private link they can copy to finish on another device. No emails are sent.

**Home** (`/review`). A six-stage bar (Open → Screen → Decide → Interview → Select → Announce) and a black "Your next step" strip tell each reviewer exactly what to do now. During Screen, the full list is shown grouped into "To score" and "Scored by you"; other reviewers' scores are hidden, only a ✓ shows whether they have scored. Each reviewer scores on six axes (1–5) with written anchors, picks Interview / Maybe / Pass, and leaves notes; scores autosave and stay editable until Decide.

**Decide** (Home, once everyone has scored). Everyone's screening scores side by side, sorted by committee average, with notes on demand. **Invite to interview** on a row makes that founder a Finalist immediately (with Undo); you can keep inviting. **Finish deciding** marks whatever is left Not selected and closes applications; it can be reopened from Round settings.

**Select** (`/review/select`). After interviews: screening and interview averages, each reviewer's Select / Decline call from live scoring, terms notes from the finalist packet, and **Select** / **Decline** buttons that record the committee's decision (status Selected / Declined). Nothing on the reviewer side ever emails an applicant.

**Finalists.** Moving to Finalist unlocks a materials page for that founder. Copy the link from the Stage box and email it; they submit links to deck, financials, and cap table. Those appear on the interview page.

**Interview day.** `/review/interviews` lists finalists by interview time. Each interview page has: a quick summary built from the application (traction, team, raised, last round, cash and burn, raising, terms), links to the materials, the three question lanes with the lead reviewer for each, screening notes from all three, shared prep notes (editable, saved to Airtable), and a live scoring column. Each reviewer scores the same five axes plus Select / Decline / Undecided. The committee grid refreshes every four seconds so everyone sees the others' scores as they are entered. Decision notes are shared.

**After.** Set the status to Selected or Declined from the screening page. Everything is in the Airtable base if you want to build views, send bulk emails, or export.

## Changing the questions

Edit `lib/schema.ts`. Each field has an Airtable field name, label, type, and whether it's required. If you add a field, add it to the Airtable base with the same name (or to the setup script before running it). The form, the reviewer view, and the prep summary all read from this file.

## Security notes

- Reviewer passwords are in the `REVIEWERS` environment variable, never in the code. Change them in Vercel without redeploying.
- Sessions are signed cookies, valid for 14 days.
- Resume and materials links contain a random token; anyone with the link can edit that draft, which is the intended behavior for founders.
- The Airtable token is only used server-side.
