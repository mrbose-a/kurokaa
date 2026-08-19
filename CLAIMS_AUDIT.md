# Kurokaa Landing Page — Product Claims Audit

**Scope:** Every product/capability claim in `index.html` (kurokaa.com), checked against the actual build in `D:\agents\AutoOps` (backend, frontend, migrations, and internal audit docs) as of 2026-08-20.

**Method:** Each claim below is graded against real evidence — a specific table, endpoint, component, or internal doc that either confirms or contradicts it. "Live" means the underlying mechanism exists in the codebase and is wired end-to-end. "Not live" means no such mechanism exists, or an internal doc explicitly says it can't work that way. "Overstated" means a real mechanism exists but the copy describes a level of granularity, autonomy, or cadence the real mechanism doesn't have.

---

## 0. CORRECTIONS TO THIS AUDIT (added 2026-08-20, after re-verification)

Three findings below were re-checked against the running code and **do not hold**. They are corrected here rather than edited in place, so the original reasoning stays visible. The root cause in all three cases is the same: parts of this audit were graded against `CLAUDE.md`'s architecture description, which is stale relative to what actually ships.

| Where | The audit said | Correction |
|---|---|---|
| §4 | "Staff Management" is overstated — payroll is UI-structure-only, ESI/PF/TDS pending | **Wrong. Payroll is fully built and shipped.** ESI (0.75% employee / 3.25% employer, ₹21,000 threshold), PF (12%/12% on basic capped at the ₹15,000 wage ceiling) and TDS all compute in `backend/app/services/payroll_engine.py:592-674`, each statute individually toggleable. Roster CRUD, attendance (clock-in/out, manual mark, exception queue) and the full draft → approve → settle → void payroll-run lifecycle are inlined at `backend/api.py:8221-11007`. Frontend is `StaffPage.tsx` (tabs: today / team / schedule / payroll / compliance) with per-employee ESI/PF/TDS breakdowns. Migrations 092 + 093. Shipped over commits `71d74bc` → `f4ed0af` → `39f48b4` → `0053f7d`. The `PROGRESS.md`/`README.md` rows the audit cited describe `PayrollPage.tsx`, a file deleted in commit `da4b3f7`. **The landing page checkmark was correct; the docs were stale.** |
| §1 | "Every 5 min · Fresh operational picture" — ✅ Accurate | **Stale.** That is the legacy multi-agent orchestrator cycle, which was scrapped as an architecture. There is no `/floor-manager` route in `autoops-frontend/src/App.tsx`; `FloorManagerShiftView.tsx` still exists as a file but is unreachable. The cadence claim should not have been graded Live. |
| §2 | Replace the fabricated rush copy with "a manager-reviewed huddle pitch every 5 minutes, built from live demand, inventory risk and your team's one-tap pulse" | **This suggested replacement is itself a false claim** — it describes the same deprecated Floor Manager subsystem. Adopting it would have swapped one unshippable claim for another. The fabricated copy was removed outright instead, and the proof section rebuilt from the four real product screenshots in `assets/demo/`. |

Everything else in §1 and all of §3 was re-checked and stands.

**Resolution:** the rewrite (2026-08-20) deleted the `rush` and `nervous` sections entirely, replaced the hero's auto-advancing ops stream with a still founder statement, corrected the onboarding auto-build list, and made "Get a demo" the single primary CTA. Section §5 below tracks what shipped.

---

## 1. LIVE — Kurokaa can do this today

These map to real, working code. Safe to keep as-is (citations included so you can spot-check).

| Claim (where on page) | Evidence |
|---|---|
| "One tap opens the till. The opening float goes straight into the ledger." (Demo beat 1) | `business_days` (stateful open/close, M066) + `cash_adjustments`/`payment_allocations` ledger — opening float is a real ledger row, not a notebook entry. |
| "Dine-in, held orders, KOT printing, GST — the billing layer." (Demo beat 2) | `held_orders`, `kitchen_ticket`, GST fields on `purchases`/`sales` — confirmed in `docs/roadmaps/sales_pilot_scope.md` (the actual pilot-day-one contract for cashier/kitchen/manager flows). |
| "Every sale is counted in ingredients... stock burns down at recipe level, automatically." (Demo beat 3) | `dish_recipes` three-tier schema + `recipe_explosion._apply_recipe_stock_change`, deducts `raw_ingredients`/`semi_finished_products` stock on every sale. |
| "Kuro catches what you'd miss" — margin-deterioration card with confidence % and a recommended fix (Demo beat 4) | `agent_decisions` (per-decision `confidence_score`), Inventory Agent, `docs/design/kuro_intelligence_v1.md`. Matches the "Kuro Intelligence briefing" screen you confirmed is real. |
| "Expected vs counted cash with zero mystery — and what Zomato actually paid you, not what they billed." (Demo beat 5) | `reconciliations` (expected vs counted cash, one row per business day) + `aggregator_settlements.gross_variance` = statement gross − Kurokaa-recorded gross (M085). This is a precise match to a real, specifically-built feature. |
| "Kurokaa remembers every guest's visits, favourites, and allergies." (Problems section) | `guests` table has an `allergies TEXT` column (migration 081); visit history and favourite dishes are computed live over `sales`/`sale_items`. Guests are business-wide (recognized across all outlets of one owner), not per-location. |
| "WhatsApp-ready customer receipts" (Pricing features) | Real, but manual: `POSTerminal.tsx`/`RevenuePage.tsx` have a "Send via WhatsApp" button that opens `wa.me` with a receipt link. It's a one-tap share action, not an automatic send — copy is accurate as written. |
| "Secure payments via Razorpay" (Trust strip) | `razorpayCheckout.ts`, `backend/app/services/billing.py`, migration `076_razorpay_billing.sql` — real subscription billing integration. |
| "Every 5 min — Fresh operational picture" (Hero stats) | Agent cycle genuinely runs every 5 minutes via cron-job.org → `POST /api/cron/run-agent-cycle`. Accurate. |
| "Not a dashboard... one-tap signals from your floor and kitchen" (Nervous System intro, general claim only) | `POST /api/pulse/kitchen`, `/api/pulse/station`, `/api/pulse/foh` — staff really do submit a one-tap state. The *general* claim ("one-tap signals exist") is true. See §2 for why the specific narrated examples built on top of it are not. |
| "GST-friendly operational records" / "GST-ready Billing" | Confirmed throughout backend (GST fields on purchases, GSTR-1 paths, `state_code` handling). |

---

## 2. OVERSTATED — real mechanism, fictional granularity/cadence

This is the important category. The underlying system (Floor Manager + Service Pulse) is real, but the landing page's narrated examples describe a level of detail, staff-level personalization, and real-time cadence that the actual system does not produce. This is exactly the pattern you flagged in the "How Kurokaa reads a rush" example.

**What the real system actually does** (`backend/app/services/floor_manager.py`, `backend/app/routers/pulse_router.py`):

- Staff submit a **coarse, categorical** pulse — kitchen: `quiet` / `managed` / `busy`; FOH: `quiet` / `managed` / `full_house` / `slight_wait` / `long_queue`; per-station: same three kitchen states, tagged to a station name pulled from `products.kitchen_station`.
- Floor Manager runs **once per 5-minute agent cycle**, not continuously. It reads `shared_agent_context` (POS demand %, inventory 86-risk items, waste-risk items) and applies three deterministic rules: 86-and-pivot menu substitution (from a hardcoded `ALTERNATIVE_MAP`), shelf-life-based staff-meal routing, and a single load-balance alert when POS demand rises >15% ("Reallocate FOH staff to expediting" — a generic instruction, not a named-person assignment).
- Output is one **2-sentence LLM-generated "huddle pitch"** per cycle, queued for **manager approve/reject/edit**, not a live autoplaying feed of decisions.
- There is **no per-staff-member routing anywhere in the codebase** — no logic that assigns a task to a specific person by name.
- There is **no numeric ticket-timing, docket-count, or "kitchen pressure %" telemetry** anywhere — the pulse states are the three/five-value categories above, nothing finer-grained.

**Specific claims this contradicts:**

| Landing page claim | Reality gap |
|---|---|
| "Pull Vikram from runner duty for 8 minutes." / "handoff to Anjali." (Hero ops stream, Dinner Rush scenarios) | No staff-name-level task assignment exists anywhere in the system. |
| "Bar backlog building... 11 dockets · avg 7 min late" | No docket-count or per-ticket lateness tracking exists. Pulse is a 3–5 state qualitative tap, not a timer. |
| "Kitchen pressure tapped High by the pass · 6-top arriving 21:18" | Pulse states are `quiet`/`managed`/`busy` — there is no "High" pressure value and no reservation/cover-arrival forecasting feeding this. |
| "Ticket trajectory deteriorating — 14 open, avg fire 9.4 min" / "Grill pressure tapped High... two 6-tops arriving in 4 min" (Dinner Rush) | Same — no per-ticket fire-time telemetry exists. |
| Hero stream refreshing every ~3 seconds with a new granular operational call, timestamped to the minute, running continuously through service | The real cycle is 5 minutes and produces one huddle pitch for manager approval — not a continuous per-minute call stream. |
| "See a dinner rush decide" — signals from "Pass," "Grill," "Garnish," "Bar," "FOH" each with hot/warm severity levels | Real signal sources feeding Floor Manager are POS demand %, inventory 86-risk, and waste-risk — three inputs, not five station-level feeds with severity scoring. |

**Suggested replacement — Hero card** (keep the "How Kurokaa reads a rush" shell, since the *underlying idea* — pulse + agent cycle → manager-reviewed recommendation — is real; just make the examples match what the system actually outputs):

> **How Kurokaa reads a rush · Saturday dinner service**
> 21:10 IST
> → **86 Butter Chicken, pivot to Murgh Lababdar.** Gravy stock flagged low by the Inventory Agent.
> *Floor Manager · pending your approval*
> → **Kitchen pulse: Busy.** FOH pulse: Slight wait. Reallocate front-of-house support to expediting.
> *Load-balance alert · demand up 18% this cycle*
> → **Chilean Sea Bass 86'd — chef tapped it at 21:08.** Suggested pivot: Black Cod.
> *86 board · confirmed by kitchen*
>
> *Refreshed every 5 minutes · reviewed and approved by your manager, not run automatically*

**Suggested replacement — Dinner Rush section:** Either (a) rebuild the three "Signals → Interpretation → Operational call" columns using only what Floor Manager actually reads (POS demand %, 86/inventory risk, waste risk, and the kitchen/FOH/station pulse taps — no ticket timers, no docket counts, no named staff), or (b) reframe the section's eyebrow from "A live decision" to something like "How a shift huddle gets built" and show the real huddle-pitch → approve/reject/modify flow, since that loop (`GET /api/floor-manager/active-briefing`, `POST /api/floor-manager/decisions/{id}/action`) is genuinely built and is a stronger, more differentiated story than fabricated station telemetry.

**Also applies to:**
- **"Not a dashboard. A second brain."** (Nervous System section) moments — "Six tickets deep at the bar," "Fryer saturation," "Garnish station behind. The chef taps twice without looking up." — same fabricated granularity. These read as scene-setting rather than product description, but sit directly under a section making a mechanism claim ("combines real transaction data, one-tap signals... into a system that runs alongside your team and tells you what to do next"). Recommend either clearly labeling these as illustrative/aspirational, or replacing with real pulse-state language ("kitchen taps Busy," "FOH taps Slight wait").
- **"Built from real service"** section (`MOMENTS` array) — same station-level narrative fiction (bar ticket counts, fryer saturation, runner disappearance, "the grill recovers, nobody notices"). This section is framed as founder-credibility/scene-setting rather than a direct capability claim, so it's lower priority, but it reinforces the same overstated picture. Consider moving it closer to "why we built this" framing and further from anything that reads as a product screenshot.

---

## 3. NOT LIVE — no evidence in the codebase, or explicitly contradicted by an internal doc

| Claim | Where | Why it's false/misleading |
|---|---|---|
| "Kurokaa ingests [the menu] and automatically builds Products, Recipes, Ingredient structure, **Prep relationships, Cooking techniques, and Station mapping** — so it's ready to work from day one." | Foundation section, "Onboarding" callout | `docs/audits/menu-import-truth-alignment-audit.md` explicitly lists **"Cooking techniques"** under items that are **"Never present"** in a menu upload and therefore never extracted. `CLAUDE.md` (Setup Pack section, M106) is direct: the AI-only menu import lane "**structurally cannot produce numbers**" — `save_menu_v2` writes `quantity_per_serving = 0` on every `dish_recipes` row, and ingredient cost is never set. A "successful" AI import yields dish→ingredient **links only** — no quantities, no costs, no batch yields, no cooking techniques. Real recipe numbers require the owner to fill out and upload the separate "Setup Pack" spreadsheet (`POST /api/setup-pack/commit`) — a manual step the landing page doesn't mention. |
| Implicit claim that "Station mapping" is a fully automatic byproduct of menu upload | same section | Partially true at best: `kitchen_station` is a real column and menu-import context enrichment does feed `kitchen_stations` (set by the *owner*, not extracted) into the AI extraction prompt to improve categorization — but this is owner-supplied context assisting AI guesses, not the AI reliably inferring station mapping from the menu photo alone. |
| Overall impression from "Set up in an afternoon" + the onboarding callout together, i.e. that one menu upload alone gets you to a working, costed system "day one" | Demo CTA note + Foundation callout | Contradicted by the existence and stated purpose of the Setup Pack lane: real recipe quantities, purchase prices, batch yields, and opening stock require the owner to fill out a spreadsheet outside the app and upload it — a separate, non-trivial step, not "upload your menu once." |

**Suggested replacement — Foundation "Onboarding" callout:**

> **Upload your menu once — Kurokaa maps it to your kitchen.**
> Kurokaa reads your menu and auto-builds Products and ingredient links from day one. For real food-cost numbers — recipe quantities, batch yields, and opening stock — fill in one guided worksheet at your own pace; Kurokaa recalculates costs the moment you do.

(Drop "Cooking techniques" and "Prep relationships" from the `AUTO_BUILDS` list entirely — replace with `['Products', 'Ingredient links', 'Station tagging (from your input)', 'A starting recipe worksheet']` or similar, so the list only names things the code actually produces.)

---

## 4. UNVERIFIED / NEEDS AN OWNER CALL — not falsifiable from code alone

| Claim | Note |
|---|---|
| "Set up in an afternoon" | No code artifact can confirm or deny a time-to-value claim like this. Given the Setup Pack step above is real work for the owner, this may be optimistic for the `menu_ai` lane; it's more plausible for a small, single-location `setup_pack` lane restaurant with a clean spreadsheet. Recommend either qualifying it ("for a single-location menu") or validating it against actual pilot onboarding times before keeping it unqualified. |
| ~~"Staff Management" (Foundation checklist, presented as a plain checkmark alongside fully-built items)~~ | ~~`PROGRESS.md` and `README.md`'s own feature table say Payroll — a core part of "Staff Management" — is UI-structure-only, with roster CRUD, attendance tracking, and payroll calculation (ESI/PF/TDS) still pending.~~ **RETRACTED — see §0.** Payroll V2 is fully built (ESI/PF/TDS engine, roster CRUD, attendance, run lifecycle). The cited `PROGRESS.md`/`README.md` rows were stale by ~13 months and referenced a deleted file. The checkmark was correct; it has been sharpened to "Staff, Roster & Payroll" to state the capability outright rather than leave it implied. |

---

## Summary — what to change first

1. **Hero card + Dinner Rush section** — highest priority. These are the most visible, most specific, and most fabricated (named staff, ticket timers, docket counts, "kitchen pressure %"). ~~Replace with the real Floor Manager/pulse output shown above.~~ **See §0 — that replacement was also invalid.** Both sections were deleted outright.
2. **Foundation "Onboarding" callout** — drop "Cooking techniques" and "Prep relationships" from the auto-built list; the Setup Pack step should be mentioned, not hidden.
3. **"Built from real service" moments + Nervous System moments** — lower priority (read as scene-setting, not a screenshot), but worth either labeling as illustrative or trimming to match real pulse-state language.
4. ~~**Staff Management checkmark** — soften or split until payroll logic ships.~~ **RETRACTED — see §0.** Payroll already shipped.

Everything in §1 is safe to keep and, if anything, underselling what's actually built (the aggregator-settlement variance detection and the guest allergy/history recall are both more specific and more impressive than the generic copy currently makes them sound).

---

## 5. WHAT SHIPPED — rewrite of 2026-08-20

`index.html` was rebuilt. Structure is now:

`hero → problems → see (4 real screenshots) → foundation → setup lanes → compounding → founder → pricing → get a demo (Cal.com) → footer`

**Removed**
- `rush` section (named staff, ticket timers, docket counts, "kitchen pressure High") — deleted, not rewritten.
- `nervous` section ("Not a dashboard. A second brain.") — deleted; mechanism-led and its moments were fabricated.
- `service` / "Built from real service" `MOMENTS` — deleted (bar ticket counts, fryer saturation, runner disappearance).
- The hero's auto-advancing `OPS_STREAM` and its `Cycle ↻ 5 min` chrome.
- `Every 5 min · Fresh operational picture` hero stat.
- "Cooking techniques" and "Prep relationships" from `AUTO_BUILDS`.
- The Web3Forms contact form, and the `Sign up` button (self-serve is now a text link).
- React 18 **development** UMD build + `@babel/standalone` from unpkg — the page compiled JSX in the visitor's browser on every load. Now static HTML with one small vanilla-JS block. HTML went 101 KB → ~69 KB with megabytes of CDN JS removed.

**Added**
- `see` — the four genuine captures in `assets/demo/`, static, with honest captions.
- `setup` — the white-glove vs self-serve lanes, so the worksheet step is stated rather than hidden.
- `compound` — what changes as data accumulates. Every rung is verifiable: `inventory_state` LEARNING → ESTIMATED → VERIFIED, `ingredient_cost_history` / EMA, `ingredient_aliases` learning counters.
- `demo` — Cal.com booking, live on `cal.com/kurokaa/30min`, with a permanently visible email fallback so a failed embed still converts.
  - **Desktop (≥768px):** inline `month_view` embed, lazy-loaded on approach, dark theme with `cal-brand` set to the Kurokaa gold. It is given the full content width, not a grid column — Cal's `month_view` renders its own host/duration/timezone panel and needs roughly 1000px; at 632px the date grid collapsed and the event title wrapped one character per line.
  - **Mobile (<768px):** the embed is deliberately **not** initialised. Measured at 390px, Cal stacks, clips its slot list at 1:00pm, and its auto-resize reports 1791px against ~1200px of drawn content — about 600px of dead space. A compact card links to Cal's own booking page instead, which is already built for mobile. (`column_view` was tried first and made no difference; Cal forces its own mobile layout below a breakpoint regardless of the `layout` param.)
  - Theme must be passed in the inline `config`, not only via `Cal('ui')` — setting it after the fact leaves the iframe on `.cal-element-embed-light`, i.e. a white panel on a dark page.

**Positioning:** outcomes only. No "agentic", no "nervous system", no mechanism language in the lead. Page title changed from "The agentic operating system for Indian restaurants".

**Open items for the owner**
- **Qualification questions are not yet on the Cal event.** The booking link is live, but "restaurant name / number of locations / current POS / where it hurts most" have to be added on Cal itself (event type → Advanced → Booking questions). Without them the demo-led flow loses the context it exists to collect.
- `og:image` pointed at `assets/kurokaa-logo.png`, which does not exist. Temporarily repointed to `assets/kurokaa_logo_white.png`; a proper 1200×630 share image should be produced.
- Unreferenced assets (checked against every `.html` in the repo — not deleted, since some may be intentional brand holdings): `assets/kurokaa_favicon.png` (1.3 MB), `assets/kurokaa-favicon.png` (812 KB), `assets/kurokaa_logo_black.png` (192 KB), `assets/hero.png` (16 KB). The two oversized favicon duplicates are the real waste — the live favicons are the root `favicon-*.png` set.
- "Set up in an afternoon" was removed rather than qualified; §4's note still stands if it is ever reintroduced.
