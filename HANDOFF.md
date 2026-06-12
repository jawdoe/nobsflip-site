# NoBSFlip — Current Handoff (read me first)

Last updated: 2026-06-11

## Where we are
Preparing to go live (custom domain). Working through a launch checklist —
currently around **step 27/28**. The remaining work is the **freemium gating**:
put the premium features behind a paywall and ship a genuinely **limited free tier**.

## Premium plumbing that already EXISTS
- `profiles` table with `is_premium`, Stripe + LemonSqueezy checkout/webhooks,
  `/upgrade-success`, `/pricing`.
- `lib/premium.ts` → `isPremium(userId)` (server-side, service role).
- Scan API (`app/api/sold-comps/route.ts`) already enforces premium:
  premium = real Apify sold data; free = eBay Finding API / Browse fallback.
- Scan page (`app/scan/page.tsx`) already hides the low/median/high **price range**
  behind `result.isPremium` and shows an upgrade CTA to free users.

## Free vs Premium contract (from `app/pricing/page.tsx` — do NOT break this)
FREE: barcode scanner with eBay comps, flip tracking (bought/listed/sold),
profit & ROI dashboard, fee rates, postage calc, scan history.
PREMIUM ($9/mo): everything in free + real sold prices, price range per scan,
connect eBay account, auto-mark sold, flip analytics.

## DECISIONS LOCKED 2026-06-11 (implement these)
1. **Free tier limit = daily scan cap.** Free users get **5 scans/day** (changed
   from 10 on 2026-06-11), then a "come back tomorrow or upgrade" prompt. Resets daily.
   - Put the cap number in ONE config constant so it's easy to change.
2. **Keep the pricing-page contract for free features** — free KEEPS flip tracking,
   dashboard, and scan history. Do NOT also cap saved flips. The daily scan cap is
   the only usage limiter. Premium-exclusive features stay as listed above.

## DONE 2026-06-11 (freemium gating implemented)
- [x] Daily scan counter: `supabase-scan-limit-migration.sql` adds
      `daily_scan_count` + `scan_count_date` to `profiles` and a `consume_scan(uuid,int)`
      RPC (atomic check-and-increment, premium = unlimited, resets daily).
- [x] Cap constant + helper in `lib/premium.ts`: `FREE_DAILY_SCAN_LIMIT = 5`
      and `consumeScan(userId)` (fails open on DB error).
- [x] Server enforcement in `app/api/sold-comps/route.ts`: calls `consumeScan`,
      returns 429 `{capReached, limit, used}` when over cap, includes
      `freeScansRemaining` in success payload. (Note: /scan is already a protected
      route in middleware, so every scanner is authenticated.)
- [x] Scan page UX (`app/scan/page.tsx`): cap-reached screen with "come back
      tomorrow / Go Premium" CTA, plus "N free scans left today" indicator.
- [x] eBay connect now gated server-side: premium check added to
      `app/api/ebay/oauth/start/route.ts` AND `.../callback/route.ts` (redirects
      non-premium to /pricing). UI was already gated in `app/profile/page.tsx`.

## DONE 2026-06-11 (premium value pass)
- [x] Scan cap lowered to 5/day (`FREE_DAILY_SCAN_LIMIT = 5`).
- [x] Demand indicator: sold-comps API returns `soldCount` + `demandLabel`
      (High/Medium/Low/None from sold-listing count). Scan page shows a premium-only
      demand card. Gives flippers a "will it sell / how fast" signal.
- [x] Trimmed "Auto-mark sold" from pricing (too fragile for launch — revisit later).
      Pricing premium list now: unlimited scans, real sold prices, price range,
      demand check, eBay connect, flip analytics. Free list notes "5 scans a day".
- [x] Built `/analytics` page (premium-gated via middleware + is_premium check):
      total profit (net of eBay fees), avg ROI, win rate, pipeline counts, best flip.
      Added "Analytics" nav link in SiteNav for premium users only.
- [x] Added defensive `flip_posts` column guards (user_id, actual_sell) to
      supabase-setup.sql — analytics/dashboard need them.

## APIFY / SOLD DATA (premium's headline feature)
- Premium "real sold prices" comes from the Apify actor `caffein.dev/ebay-sold-listings`
  (~$4 / 1000 results = ~$0.10 per 25-result scan). Set `APIFY_TOKEN` in Vercel or
  premium silently falls back to ACTIVE asking prices (feature doesn't actually work).
- Cost control: `sold_comps_cache` table caches Apify results by search term + country
  for 7 days (CACHE_TTL_DAYS in app/api/sold-comps/route.ts). Premium-only; cache hits
  are free. Margin note: $9/mo unlimited vs $0.10/scan — caching is what keeps this
  profitable for heavy users. If volume outgrows it, consider a flat-rate provider
  (RapidAPI eBay sold APIs ~$10-40/mo; PriceCharting flat-rate for games/cards).
- eBay's official Marketplace Insights API (free sold data) is approval-only/partner —
  not obtainable as an indie.

## MANUAL STEPS REMAINING (do these to finish go-live)
0. RE-RUN `supabase-setup.sql` (idempotent) — now also creates `sold_comps_cache`.
   Set `APIFY_TOKEN` in Vercel. PUSH the code (git) — Vercel "Redeploy" alone does
   NOT include un-pushed code.
1. Run BOTH migrations in the Supabase SQL editor:
   - `supabase-premium-migration.sql` (if not already run)
   - `supabase-scan-limit-migration.sql`  <-- NEW, required for the cap
2. Run `npm run build` locally and deploy. (Could NOT verify the build in-session:
   the assistant's sandbox mount was serving stale/truncated copies of files, so
   tsc/build reported false syntax errors. The real files on disk are correct.)
3. Smoke test: free account -> 11th scan in a day should hit the cap screen;
   premium account -> unlimited + price range + real sold data + eBay connect.

## NOT BUILT YET (advertised on pricing page, future work)
- "Flip analytics — best categories, avg ROI, trends": no /analytics route exists.
  Either build it or trim it from PREMIUM_FEATURES before launch.
- eBay token storage (`app/api/ebay/oauth/callback`) inserts into `ebay_oauth_tokens`
  WITHOUT a user_id association — review this for multi-user correctness.

## Housekeeping (pre-existing, unrelated to gating)
- `nobsflip-bot/node_modules` (~3,759 files) was being tracked by git, flooding
  `git status` and the assistant's context (cause of the "90% limit" warnings).
  `.gitignore` is now fixed to ignore `node_modules/` everywhere. The untrack
  (`git rm -r --cached nobsflip-bot/node_modules`) is STILL PENDING because a stale
  `.git/index.lock` phantom blocks it from the assistant's sandbox. Run from your
  own terminal when convenient:
  `git rm -r --cached nobsflip-bot/node_modules && git rm --cached middleware.ts.bak test.ts test_write.tmp tsconfig.tsbuildinfo && git commit -m "chore: stop tracking node_modules and build cruft"`
