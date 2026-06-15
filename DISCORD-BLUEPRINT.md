# NoBSFlips Discord — Build Blueprint

Remake of the old QuestXP server into the NoBSFlips community hub.
All-in-one (community + support + updates + premium perks), bogan voice,
premium subscribers get exclusive access.

---

## 1. Server identity

**Name:** **The Flip Shed — NoBSFlips**

**Server description:** "Oi ya legend — scan it, flip it, bank it. The straight-up
crew for flippers who want real numbers, not dodgy business. All welcome."

**Traits (5):** 💰 Flipping & Reselling · 🏷️ Bargain Hunting · 📦 eBay Sellers ·
💸 Side Hustle · 🛒 Thrifting

**Icon:** bogan mascot. **Banner:** purple, to match the app.
**Theme:** Aussie-flavoured (the voice/personality) but **open to everyone** — not Aussie-only.

---

## 1b. Community mode (turn this ON — it changes a few things)

Enabling Community unlocks better tools, and makes two channels required:

- **Required:** a **Rules** channel (`#the-rules`) and a **Community Updates** channel
  (admin-only — Discord posts moderation notices there; members don't need it).
- **Onboarding (use this instead of manual reaction-role verify):** new members answer
  a question or two ("New or seasoned flipper?", "What do you flip?") and Discord
  auto-assigns roles / reveals channels. Smoother than reaction-roles. Pair with
  **Membership Screening** (agree-to-rules gate) to block bots.
- **Welcome Screen:** highlight ~3–5 channels for newcomers — point them at
  `#how-it-all-works`, `#show-ya-flips`, and `#bot-commands`.
- **Announcement channels:** make `#oi-listen-up` and `#app-updates` *Announcement*
  type so members (and other servers) can follow them.
- **AutoMod + Raid Protection (Safety):** turn ON — a money/reselling community attracts
  scam bots and spam. AutoMod auto-blocks scam links and spam.
- **Server Insights:** free analytics (growth, retention, active channels). Opt into
  **Discovery** once eligible — your traits/description feed it for free reach.

---

## 2. Roles (top to bottom)

| Role | Who | How assigned |
|---|---|---|
| 🛠️ **Head Flogger** | You / owner | Manual |
| 🧰 **Bogan Bouncers** | Mods | Manual |
| 💎 **Premium Flogger** | Paying subscribers | **Auto** via the bot (see §5) |
| 🤑 **Cashed-Up Bogans** | Server boosters (Nitro) | Auto on boost |
| 👷 **The Crew** | Verified members | Auto via Onboarding |
| 🤖 **Bots** | Bots | Manual |
| 🪰 **Blow-in** | Unverified (just joined) | Default on join |

Premium role colour = purple/gold so it stands out in the member list.

---

## 3. Categories & channels (bogan voice)

### 📋 START HERE / THE FRONT DOOR
- **#welcome-mat** — auto-welcome, what the server is, link to the app
- **#the-rules** — keep it civil, no scams, no spruiking other apps *(required by Community)*
- **#how-it-all-works** — how to use the app + the bot, quick-start
- **📢 #oi-listen-up** — announcements (Announcement channel, post-only)
- **#community-updates** — *(required by Community; admin-only)* Discord's notices to you
- *No separate verify channel — handled by Server Onboarding + the rules gate (§1b).*

### 🛒 THE FLIP FLOOR (community)
- **#general-yarn** — general chat
- **#show-ya-flips** — post your finds & wins (images on)
- **#wins-n-profits** — brag your profit (screenshots from the app)
- **#flops-n-fails** — the ones that bombed (keeps it real, builds bonding)
- **#sourcing-tips** — where to find the good gear (op shops, markets, councils)
- **#whats-this-worth** — "help me ID / price this" with photos

### 📱 THE APP
- **🤖 #bot-commands** — where the nobsflips bot lives (track flips, profit, etc.)
- **#app-chat** — talk about the app, how-tos
- **#feature-requests** — what they want built next (react to upvote)
- **#help-me-out** — support / bug reports
- **🆕 #app-updates** — changelog (locked, post-only; wire to your deploys later)

### 💎 THE VIP SHED (Premium Flogger role only — locked to others)
- **#premium-lounge** — subscribers-only chat
- **🔥 #premium-deals** — hot sourcing leads / underpriced items spotted
- **⚡ #priority-support** — jump the queue
- **#premium-bot** — advanced bot commands (bigger pulls, analytics)

### 🔊 VOICE
- **The Lounge** — general voice
- **Sourcing Run** — voice to yarn while you're out op-shopping

---

## 4. The nobsflips bot — commands

Lives mainly in **#bot-commands** (and **#premium-bot** for premium-only ones).
Existing commands in your `nobsflip-bot` repo, surfaced to users:

- `/flip-add` — log a new flip
- `/flip-list` — your flips
- `/flip-view` — details on one flip
- `/flip-edit` — update a flip
- `/flip-sold` — mark sold + record sale price
- `/flip-delete` — remove a flip
- `/profit` — your total profit / ROI
- *(admin/owner only)* `/ebay-create-draft`, `/ebay-publish`, `/ebay-auth-check`

**New commands to add for the integration (see §5):**
- `/link` — connect your Discord to your NoBSFlips app account
- `/whoami` — show your linked account + plan status

---

## 5. The premium tie-in (Discord ↔ app)

Goal: paying subscribers automatically get the **Premium Flogger** role and the
VIP Shed, and their flips are the same whether they use the web app or Discord.

**How it links (build plan):**
1. Add a `discord_id` column to the `profiles` table.
2. User runs **`/link`** in Discord → bot gives them a short code (or a login link)
   → they confirm in the app → app saves their `discord_id` on their profile.
3. **Auto-role:** when someone goes premium (the LemonSqueezy webhook already fires),
   also look up their `discord_id` and have the bot **grant the Premium Flogger role**.
   When they cancel/expire → bot **removes** the role. (One periodic `/sync` job as a
   safety net for anyone the webhook missed.)
4. Avatars: once linked, the app can pull their Discord avatar as their profile pic
   (this is the "avatar from Discord" idea — solves the broken avatar button too).

This makes the $9 sub worth more (Discord perks) and ties the two products together.

---

## 6. Execution order

1. **Rename** the server + set icon/description.
2. **Wipe/rework** old QuestXP categories & channels → build the structure in §3.
3. **Create roles** (§2), set the Premium Flogger channel permissions on the VIP Shed.
4. **Turn on Community**, then set up **Onboarding** (questions → The Crew role +
   channel reveals), **Membership Screening** (rules gate), and **AutoMod + Raid
   Protection**. Create the required **#community-updates** channel (admin-only).
5. **Invite the nobsflips bot**, give it: Manage Roles (below its own role),
   Send Messages, Read History, Manage Channels (only if it'll build channels).
6. **Build the `/link` + auto-role integration** (§5) — this is the dev work; do it
   after the channels exist.
7. **Seed content** — write the welcome, rules, how-it-works; drop a few example
   flips in #show-ya-flips so it's not a ghost town at launch.

---

## 7. Notes / decisions still open
- Whether the bot should **auto-build** the channels (needs Manage Channels perm) or
  you set them up by hand from this doc.
- **Onboarding questions** — what to ask new members (e.g. "New or seasoned?",
  "What do you flip — games / clothes / a bit of everything?").
