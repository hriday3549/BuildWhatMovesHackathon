# Nivaran — UX Layout Spec v2
Matched to complaints.mahafda.in screenshots + your actual sitemap. Supersedes the IA/nav assumptions in v1 (which assumed guest browsing and a 3-item nav — your real sitemap is simpler and login-gated; use this version).

---

## 0. What changed from v1, and why

- v1 assumed public browsing and a persistent 3-item nav. Your real sitemap is login-gated and route-minimal — this version matches it exactly, no invented pages.
- Structure below borrows the reference's proven components (split-screen auth, numbered stepper, pill CTAs, icon-square cards). Colors use **your** existing Ink Blue / Stamp Green / Red Tape / Seal Ochre palette, not the reference's violet — so the visual identity stays tied to your ribbon-cut/stamp flagship moment instead of becoming a generic reskin.
- Cut, deliberately: Leadership carousel, News/Notices, toll-free banner. These are real-department content you can't and shouldn't fake — see §9.

---

## 1. Shared components (every page)

**Header**
- Left: logo lockup mirroring the reference's twin-box pattern — a national-emblem-style placeholder + your Nivaran mark, then title **"Nivaran"** with subtitle **"CPGRAMS 2.0 · Cut the Red Tape"** underneath (same title+subtitle stacking the reference uses).
- Right: accessibility controls (A- / A / A+, contrast toggle) — keep these, they're cheap and they're a real trust signal. Language pill (EN / हिं). No separate "Department Login" button — your `/login` already handles both roles, so a second entry point would just be duplicate UI.

**Footer**
- One line, minimal: a few policy-style links (can be non-functional placeholders — standard convention, judges won't click them) + **"© 2026 Nivaran — hackathon prototype."** Say prototype, plainly. Don't lift the reference's literal "Government of Maharashtra" copyright line — impersonating a real department's footer is a legitimacy problem for a judged demo, not a legitimacy win.

**Ticket card** (reused on `/dashboard` and `/officer`)
- Category icon in a rounded square (reference's icon-square language), title, ticket ID in mono, status pill, date, small proof-photo thumbnail when one exists.

---

## 2. `/` — Landing

Mirrors the reference's hero + "how it works" structure, one CTA only (your sitemap says one CTA into `/login` — simpler than the reference's two-button Lodge/Track split, and correct, since tracking lives inside `/dashboard` post-login in your model, not a separate public flow).

1. **Hero** — Ink Blue gradient card, pill badge "Nivaran · CPGRAMS 2.0", headline **"Cut the Red Tape."**, one line of subtext, single CTA **"File a Grievance"** (Stamp Green, matches the reference's teal Lodge button) → `/login`. Keep the soft decorative circles bottom-right — cheap, tasteful, not flashy.
2. **"How it works," reframed to foreshadow your flagship feature** (the reference's 3 steps are about intake only, because FDA has no citizen-verification step — yours should set up F1 on the very first screen):
   - **"Tell us"** (mic/message icon) — voice or text, add a photo
   - **"We route it"** (pin icon) — straight to the right ward officer, no ministry-picking
   - **"You confirm it's fixed"** (stamp icon) — officer must show proof; you approve or reject it
3. **Stats strip** (replaces Leadership) — 3-4 numbers from your own mock data: *"1,204 resolved this month · 4.1 day avg · 91% closed with photo proof."* Same trust job as the reference's minister carousel, built from content you actually control.

No News, no Notices, no helpline banner — not in your sitemap, and there's no real content behind them.

---

## 3. `/login` — role picker + OTP

Mirrors the split-screen structure almost exactly.

**Left panel** (Ink Blue gradient, matches your hero): pill badge, headline **"Two people, one proof loop."**, numbered list doubling as onboarding copy for judges: *"1 Pick who you are · 2 File or manage a real grievance · 3 Watch it get resolved end-to-end."*

**Right panel, two states:**

- **State A — role pick:** two equal-size cards, not a dropdown — **"Priya Sharma — Citizen"** / **"Ramesh Kumar — Officer"**, each with a small icon and one line ("File and track grievances" / "Investigate and resolve assigned tickets"). No stepper here — this is a demo-specific screen, name it plainly rather than dressing it up as "step 1 of 3."
- **State B — OTP, after picking a role:** mirrors the reference's OTP screen — "Signing in as Priya Sharma," phone number pre-filled and greyed out, **"Send OTP"**, then OTP field pre-filled with **"123456"** labeled **"Demo OTP — auto-filled for judges,"** single **"Continue"** button. Reassurance box, but honest for a demo context: *"This is a mocked login. No real SMS is sent."* — more appropriate here than copying the reference's real-user privacy copy verbatim.

Total taps from landing to inside the product: 2.

---

## 4. `/dashboard` — citizen home

- Greeting header: **"Welcome back, Priya"** — not "Dashboard." That word alone is the difference between a bureaucratic screen and a personal one.
- Persistent top-right CTA: **"+ New complaint"** (Stamp Green) → `/new-complaint`. Always visible, mirrors the reference's persistent Lodge-a-Grievance pattern.
- **"Awaiting your sign-off"** section first, shown only when non-empty — Red Tape-accented left border, top of page. This is a direct sitemap requirement, don't let it slip to a generic chronological sort.
- **"In progress"** section next.
- **"Resolved"** section last, collapsed/muted — it shouldn't compete for attention with things that need action.
- Empty state (no tickets yet): reuse the ticket-card component styled as a single prompt card — same visual pattern as the reference's bottom "Found unsafe food? Lodge a Grievance" banner, just repurposed. Cheap reuse, one component doing two jobs.

---

## 5. `/new-complaint` — 4-step wizard

Stepper matches the reference's numbered-circle pattern exactly: **1 Category — 2 Details — 3 Location — 4 Review**

- **Step 1 — Category:** icon tiles (Roads, Water, Electricity, Sanitation, etc.), not a dropdown — reuses the icon-square language from the reference's "how it works" cards.
- **Step 2 — Details:** one branching follow-up question (chip/radio choices, driven by the category picked in step 1) → description field with an inline, clearly-labeled mic button for voice-to-text → camera-first photo capture button (triggers device camera directly, not a file picker).
- **Step 3 — Location:** map with GPS-detected pin, editable by drag.
  - **Cluster-check interstitial** (conditional — only appears if nearby matches exist, don't count it as a numbered step): *"3 people near you already reported this."* → **[Join this report]** / **[No, file separately]**. This is flagship feature #2 — give it a real visual moment here rather than hiding it in backend logic.
- **Step 4 — Review:** summary card (category, location, photo thumbnail, transcript) → submit → confirmation screen shows the ticket ID (mono font) and the assigned officer's name, matching your own reassurance principle.

---

## 6. `/ticket/:id`

- **Journey line** (delivery-tracking pattern, borrowed trust): `Filed → Assigned → In Progress → Proof Submitted → Awaiting Your Sign-off → Resolved`, horizontal, timestamps in mono.
- When status is "awaiting sign-off": officer's proof photo shown large with geotag + timestamp caption, and **two equal-weight buttons** — **"Confirm Fixed"** (Stamp Green) / **"Reopen This"** (Red Tape). Same size, same visual prominence — this is non-negotiable given F1 is your flagship claim; making one button dominant and the other a text link undercuts the entire pitch.
- **Reopen flow:** single prompt — "Add a photo showing it's still not fixed" + short note → resubmit → ticket reopens, timeline gets a new "Reopened" event, status reverts to in-progress.

---

## 7. `/officer`

- One screen, minimal — matches your own rule that the admin side is assumed built well.
- List of assigned tickets (same card component as the citizen dashboard), each with an **"Upload Proof"** action on unresolved ones → opens camera capture → confirms → updates ticket state to "awaiting citizen sign-off."

---

## 8. `/transparency` (phase 2, only if B7 gets built)

- Heatmap using the same stats already built for the landing strip — reuse the data model, don't build a second one.
- Ward performance list, sorted **worst-to-best** by default — the point of a public accountability tool is pressure, not a highlight reel.

---

## 9. What to cut from the reference, and why

- **Leadership carousel** — you have no real ministers or commissioners. Fabricating this looks like satire to a judge, which actively damages credibility. Skip entirely.
- **News & Notices columns** — no real content behind them, not in your sitemap. Skip.
- **Toll-free helpline banner** — you don't have a real number; inventing one is worse than having none. If you want the "we thought about non-digital citizens" signal, one honest line in the footer does that job without the fake banner.
