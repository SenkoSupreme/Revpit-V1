# REVPIT Platform — Function Reference Guide

> **Location of source code:** `c:\Users\SEN VON DOOM\OneDrive\Desktop\RVP_Proj\Revpit-V1\revpit\src`
> **Last updated:** 2026-03-20 (Sidebar: logo updated to side_nav_logo.png, guest logo link now routes to / instead of /dashboard; Store made public — AuthGateModal popup for guests, StoreHeroCTA + GuestDetailActions client components, /store(.*) added to middleware public routes; Landing page store section + navbar/footer links added; AdminTabs client component for correct active-tab highlighting on navigation; Admin action log: migration 008, logAction helper in all mod actions, /admin/logs page with actor summary + filters, mod role-change protection hardened, Logs tab added to admin layout; Admin panel + role system: migration 007, roles.ts, /admin dashboard + store/community/users moderation, AppSidebar role-aware nav; Pit Market store: store_listings + club_members migration, StoreListingCard component, /store browse+filter page, /store/new create listing form with Supabase Storage image upload, /store/[id] detail + owner actions, store/actions.ts server actions)
> **Rule:** This file must be updated whenever a new function, hook, server action, or component is added to the codebase.

---

## Table of Contents

1. [Design Tokens](#1-design-tokens)
2. [Supabase Admin Client](#2-supabase-admin-client)
3. [Scoring Engine](#3-scoring-engine)
4. [Community Actions](#4-community-actions)
5. [Settings Actions](#5-settings-actions)
6. [Quests Actions](#6-quests-actions)
7. [Clubs Actions](#7-clubs-actions)
8. [Onboarding Actions](#8-onboarding-actions)
9. [Realtime Hooks](#9-realtime-hooks)
10. [Middleware](#10-middleware)
11. [Components](#11-components)
12. [Store Actions (Pit Market)](#12-store-actions-pit-market)

---

## 1. Design Tokens

**File:** `src/lib/design-tokens.ts`

Exports a single `tokens` object containing all brand colors and font families. Use this instead of hardcoding hex values or font strings anywhere in the app.

### `tokens`

```ts
import { tokens } from '@/lib/design-tokens';
```

| Property | Value | Description |
|---|---|---|
| `tokens.colors.black` | `#0E0D0C` | Primary background color |
| `tokens.colors.white` | `#F5F4F0` | Primary text / surface color |
| `tokens.colors.grey.100` | `#F0EFEB` | Lightest grey |
| `tokens.colors.grey.300` | `#C4C3BE` | Light grey |
| `tokens.colors.grey.500` | `#898882` | Mid grey |
| `tokens.colors.grey.700` | `#504F4B` | Dark grey |
| `tokens.colors.grey.900` | `#1E1D1B` | Near-black grey |
| `tokens.colors.accent` | `#C8FF00` | Brand accent (lime green) |
| `tokens.colors.error` | `#FF4444` | Destructive / error states |
| `tokens.colors.success` | `#00D68F` | Success / confirmed states |
| `tokens.fonts.display` | `"Bebas Neue", sans-serif` | Large headings |
| `tokens.fonts.body` | `"DM Sans", sans-serif` | Body text |
| `tokens.fonts.mono` | `"JetBrains Mono", monospace` | Labels, numbers, badges |
| `tokens.shadows.card` | CSS shadow string | Standard card depth |
| `tokens.shadows.raised` | CSS shadow string | Elevated/hovered card |
| `tokens.shadows.accentSm/Md/Lg` | CSS shadow strings | Neon accent glow at 3 sizes |
| `tokens.transitions.fast` | `150ms ease-out` | Hover color, opacity |
| `tokens.transitions.base` | `200ms ease-out` | Standard state change |
| `tokens.transitions.slow` | `300ms ease-out` | Page-level motion |
| `tokens.radii.sm/md/lg/xl/full` | `3/6/12/20/9999` | Border-radius scale (px) |
| `tokens.spacing.pagePad` | `48` | Default page horizontal padding |
| `tokens.spacing.sectionGap` | `32` | Gap between page sections |

### Exported Types

| Type | Description |
|---|---|
| `Tokens` | Full `typeof tokens` |
| `ColorToken` | `typeof tokens.colors` |
| `GreyScale` | `typeof tokens.colors.grey` |
| `FontToken` | `typeof tokens.fonts` |
| `ShadowToken` | `typeof tokens.shadows` |

**Usage:**
```tsx
import { tokens } from '@/lib/design-tokens';

<div style={{ backgroundColor: tokens.colors.black, fontFamily: tokens.fonts.body }}>
  <h1 style={{ fontFamily: tokens.fonts.display, color: tokens.colors.accent }}>
    REVPIT
  </h1>
</div>
```

---

## 2. Supabase Admin Client

**File:** `src/lib/supabase/admin.ts`

### `createAdminClient()`

```ts
import { createAdminClient } from '@/lib/supabase/admin';
```

Creates a Supabase client authenticated with the **service role key**, which bypasses all Row Level Security (RLS) policies.

**Returns:** `SupabaseClient` — standard Supabase JS client

**When to use:**
- Inside any **server action** or **server component** that reads or writes to the database
- After verifying the caller via Clerk (`auth()`) — never expose to the client

**Why this exists:**
The app uses Clerk for authentication, not Supabase Auth. Supabase's `auth.uid()` returns `null` because no Supabase JWT session is created. Using RLS policies that check `auth.uid()` would always fail. The admin client bypasses this entirely.

**Environment variables required:**
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — JWT service role key (from Supabase project settings)

**Do NOT use:**
- `createClient()` from `src/lib/supabase/server.ts` — broken with the `sb_publishable_...` key format
- `createClient()` from `src/lib/supabase/client.ts` — client-side only, no auth bypass

**Example:**
```ts
'use server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

const { userId } = await auth();
if (!userId) return { error: 'Not authenticated.' };

const admin = createAdminClient();
const { data } = await admin.from('profiles').select('*').eq('clerk_id', userId);
```

---

## 3. Scoring Engine

**File:** `src/lib/scoring.ts`

Pure utility module — no database calls, no side effects. Used to compute a driver's score and tier from profile data.

### Types

#### `ScoreInput`
```ts
type ScoreInput = {
  carSpecCompleteness: number; // 0–100 (percentage)
  socialFollowers:     number;
  questCompletions:    number;
  clubActivity:        number;
  communityScore:      number; // raw community_score from profiles table
};
```

#### `Tier`
```ts
type Tier = 'starter' | 'advanced' | 'pro' | 'elite';
```

| Tier | Score Range |
|---|---|
| `starter` | 0 – 2,499 |
| `advanced` | 2,500 – 4,999 |
| `pro` | 5,000 – 7,499 |
| `elite` | 7,500 – 10,000 |

#### `ScoreResult`
```ts
type ScoreResult = {
  score: number; // 0–10,000
  tier:  Tier;
};
```

#### `CommunityAction`
```ts
type CommunityAction =
  | 'post_drop'         // +5 points
  | 'drop_10_revs'      // +15 points
  | 'drop_50_revs'      // +40 points
  | 'drop_trophy'       // +100 points
  | 'reply_10_revs'     // +10 points
  | 'build_update_drop' // +20 points
```

### `calculateScore(input: ScoreInput): ScoreResult`

Calculates a weighted score (0–10,000) and tier from the given inputs.

**Weight breakdown (must sum to 1.00):**

| Factor | Weight | Soft Max |
|---|---|---|
| `carSpecCompleteness` | 28% | 100 |
| `questCompletions` | 30% | 100 completions |
| `socialFollowers` | 18% | 10,000 followers |
| `clubActivity` | 12% | 100 |
| `communityScore` | 12% | 5,000 points |

**Example:**
```ts
import { calculateScore } from '@/lib/scoring';

const result = calculateScore({
  carSpecCompleteness: 80,
  socialFollowers: 2500,
  questCompletions: 12,
  clubActivity: 30,
  communityScore: 400,
});
// result => { score: 4280, tier: 'advanced' }
```

### `getCommunityScorePoints(action: CommunityAction): number`

Returns the number of community score points awarded for a given action. Used alongside `updateCommunityScore()` in server actions.

**Example:**
```ts
import { getCommunityScorePoints } from '@/lib/scoring';

const pts = getCommunityScorePoints('post_drop'); // => 5
const pts = getCommunityScorePoints('drop_trophy'); // => 100
```

---

## 4. Community Actions

**File:** `src/lib/actions/community.ts`
**Directive:** `'use server'`

All 10 functions use `createAdminClient()` for database access. Write functions validate the caller via Clerk `auth()` before any DB operation.

**Supabase joins used:**
- `AUTHOR_SELECT` — joins `profiles` via `author_id` → returns `{ username, avatar_url, score, tier }`
- `PIT_SELECT` — joins `pits` via `pit_id` → returns `{ name, display_name }`
- `PAGE_SIZE` — 20 items per page

---

### `getPits(): Promise<Pit[]>`

Fetches all pits (topic groups), ordered by `member_count` descending.

**Returns:** Array of `Pit` objects, or `[]` on error.

**Example:**
```ts
import { getPits } from '@/lib/actions/community';

const pits = await getPits();
// [{ id, name, display_name, description, member_count, ... }, ...]
```

---

### `getPit(name: string): Promise<Pit | null>`

Fetches a single pit by its URL slug name.

**Parameters:**
- `name` — pit slug (e.g. `'jdm'`, `'stance'`)

**Returns:** `Pit` or `null` if not found.

**Example:**
```ts
const pit = await getPit('jdm');
```

---

### `getDrops(options): Promise<Drop[]>`

Fetches a paginated list of drops with author and pit info joined.

**Parameters:**
```ts
{
  pitName?: string;   // filter to a specific pit (by slug)
  sort: FeedSort;     // 'hot' | 'new' | 'top' | 'rising'
  filter?: string;    // time filter for 'top' sort: 'all' | 'today' | 'week' | 'month'
  page?: number;      // 0-indexed page number (default: 0)
}
```

**Sort algorithms:**
- `hot` — ordered by `score` desc, then `created_at` desc
- `new` — ordered by `created_at` desc
- `top` — ordered by `rev_count` desc; supports time filter
- `rising` — Wilson-score-like decay: `rev_count / (age_hours + 2)^1.5`, computed client-side on 200 most-recent drops

**Returns:** Array of `Drop[]`, or `[]` on error.

**Example:**
```ts
const drops = await getDrops({ sort: 'hot', page: 0 });
const pitDrops = await getDrops({ pitName: 'stance', sort: 'new', filter: 'week', page: 0 });
```

---

### `getDrop(id: string): Promise<Drop | null>`

Fetches a single drop by UUID, with author and pit info joined.

**Parameters:**
- `id` — drop UUID

**Returns:** `Drop` or `null`.

**Example:**
```ts
const drop = await getDrop('abc-123-...');
```

---

### `getReplies(dropId: string): Promise<Reply[]>`

Fetches all replies for a drop and assembles them into a nested tree.

**Parameters:**
- `dropId` — drop UUID

**Returns:** Nested `Reply[]` where each `Reply` has a `children` array.

**Tree assembly (internal `buildReplyTree`):**
Iterates flat list once, maps by ID, then assigns children to parents. Orphaned replies (parent deleted) surface at root level.

**Example:**
```ts
const replies = await getReplies(drop.id);
// replies[0].children[0].children[...] — up to N levels deep
```

---

### `createDrop(data): Promise<{ id: string } | { error: string }>`

Creates a new drop. Requires authenticated Clerk session.

**Parameters:**
```ts
{
  pitId:        string;        // required — pit UUID
  title:        string;        // required
  body?:        string;        // optional body text
  type?:        DropType;      // 'text' | 'image' | 'video' | 'poll' | 'build_update' (default: 'text')
  mediaUrls?:   string[];      // Supabase Storage URLs
  pollOptions?: PollOption[];  // array of poll choices
  tag?:         DropTag;       // content tag (e.g. 'question', 'build')
}
```

**Side effects:**
- Calls `updateCommunityScore(profile.id, 5)` to award +5 community points
- Calls `revalidatePath('/community')` to bust Next.js cache

**Returns:** `{ id: string }` on success, `{ error: string }` on failure.

**Example:**
```ts
const result = await createDrop({
  pitId: pit.id,
  title: 'My build update',
  body: 'Finally finished the suspension...',
  type: 'build_update',
  tag: 'build',
});

if ('error' in result) console.error(result.error);
else console.log('New drop id:', result.id);
```

---

### `createReply(data): Promise<{ error?: string }>`

Creates a reply on a drop, optionally nested under another reply.

**Parameters:**
```ts
{
  dropId:          string;  // required — drop UUID
  body:            string;  // required — reply text
  parentReplyId?:  string;  // optional — parent reply UUID for nesting
}
```

**Side effects:**
- Calls `supabase.rpc('increment_reply_count', { drop_id })` to bump the drop's reply counter
- Calls `revalidatePath('/community/drop/[id]')` to bust cache

**Returns:** `{}` on success, `{ error: string }` on failure.

**Example:**
```ts
const result = await createReply({
  dropId: 'abc-123',
  body: 'Great build!',
});
// Nested reply:
const nested = await createReply({
  dropId: 'abc-123',
  body: 'Agreed!',
  parentReplyId: 'reply-uuid',
});
```

---

### `voteOnDrop(dropId, vote): Promise<VoteResult | { error: string }>`

Handles REV/IDLE voting with toggle and switch logic.

**Parameters:**
- `dropId` — drop UUID
- `vote` — `'rev' | 'idle'`

**Vote logic:**
- If no existing vote → **insert** new vote, increment counter
- If same vote exists → **delete** (toggle off), decrement counter, `user_vote = null`
- If opposite vote exists → **update** to new vote, swap counters

**Returns on success:**
```ts
{
  rev_count:  number;
  idle_count: number;
  score:      number;      // rev_count - idle_count
  user_vote:  'rev' | 'idle' | null;
}
```

**Side effects:**
- Updates `drops.rev_count`, `drops.idle_count`, `drops.score`
- Calls `revalidatePath('/community/drop/[id]')`

**Example:**
```ts
const result = await voteOnDrop(drop.id, 'rev');
if ('error' in result) return;
console.log(`Score: ${result.score}, User voted: ${result.user_vote}`);
```

---

### `joinPit(pitId: string): Promise<{ error?: string }>`

Adds the authenticated user as a member of a pit.

**Parameters:**
- `pitId` — pit UUID

**Behavior:**
- Inserts row into `pit_members` with `role: 'member'`
- If user is already a member (unique constraint `23505`) → silently succeeds
- Calls `supabase.rpc('increment_member_count', { pit_id })` on success
- Calls `revalidatePath('/community')`

**Returns:** `{}` on success, `{ error: string }` on failure.

**Example:**
```ts
const result = await joinPit(pit.id);
```

---

### `updateCommunityScore(userId: string, points: number): Promise<{ error?: string }>`

Increments a user's `community_score` and overall `score` by the given number of points.

**Parameters:**
- `userId` — profiles.id UUID (NOT Clerk user ID)
- `points` — number of points to add (use `getCommunityScorePoints()` from scoring.ts)

**Note:** Called internally by `createDrop()`. Can also be called directly for other reward scenarios.

**Returns:** `{}` on success, `{ error: string }` if profile not found or update fails.

**Example:**
```ts
import { updateCommunityScore } from '@/lib/actions/community';
import { getCommunityScorePoints } from '@/lib/scoring';

await updateCommunityScore(profile.id, getCommunityScorePoints('drop_trophy'));
```

---

## 5. Settings Actions

**File:** `src/app/settings/actions.ts`
**Directive:** `'use server'`

### `updateProfile(_prev, formData): Promise<SettingsState>`

Updates the current user's profile fields. Designed for use with React 19 `useActionState`.

**FormData fields:**
| Field | Type | Description |
|---|---|---|
| `bio` | string | Profile bio text |
| `instagram_handle` | string | Instagram username (no `@`) |
| `social_followers` | string (parsed to int) | Follower count |

**Side effects:**
- Recalculates `profile_completion` (base 50 + 10 if bio + 10 if followers)
- Calls `revalidatePath('/profile')` and `revalidatePath('/settings')`

**Returns:** `SettingsState`
```ts
type SettingsState = { error: string | null; success: boolean };
```

**Example (with useActionState):**
```tsx
'use client';
import { useActionState } from 'react';
import { updateProfile } from '@/app/settings/actions';

const [state, action] = useActionState(updateProfile, { error: null, success: false });

<form action={action}>
  <textarea name="bio" />
  <input name="instagram_handle" />
  <input name="social_followers" type="number" />
  <button type="submit">Save</button>
</form>
```

---

### `updateCar(_prev, formData): Promise<SettingsState>`

Upserts the current user's car record. Creates the car row if it doesn't exist.

**FormData fields:**
| Field | Type | Required | Validation |
|---|---|---|---|
| `make` | string | Yes | Non-empty |
| `model` | string | Yes | Non-empty |
| `year` | string (parsed to int) | Yes | 1900 ≤ year ≤ current year + 1 |
| `mods` | string | No | Free text |

**Side effects:**
- Upserts into `cars` table with `onConflict: 'user_id'`
- Calls `revalidatePath('/profile')` and `revalidatePath('/settings')`

**Returns:** `SettingsState`

---

## 6. Quests Actions

**File:** `src/app/quests/actions.ts`
**Directive:** `'use server'`

> **Note:** This file currently uses `createClient()` from `server.ts`. If it encounters fetch failures, migrate to `createAdminClient()` following the established pattern.

### `submitQuest(questId: string): Promise<{ error?: string }>`

Submits a quest for review. Guards against duplicate submissions.

**Parameters:**
- `questId` — quest UUID from the `quests` table

**Duplicate check:**
- If `user_quests` row exists with `status = 'approved'` → returns `'Quest already completed.'`
- If row exists with `status = 'pending'` → returns `'Quest already submitted — awaiting review.'`

**On success:**
- Inserts row into `user_quests` with `status: 'pending'`, `progress: 100`, `submitted_at: now()`
- Calls `revalidatePath('/quests')`

**Returns:** `{}` on success, `{ error: string }` on failure.

**Example:**
```ts
const result = await submitQuest(quest.id);
if (result.error) alert(result.error);
```

---

## 7. Clubs Actions

**File:** `src/app/clubs/actions.ts`
**Directive:** `'use server'`

### `createClub(_prev, formData): Promise<CreateClubState>`

Creates a new club. Designed for use with `useActionState`.

**FormData fields:**
| Field | Type | Required | Validation |
|---|---|---|---|
| `name` | string | Yes | Max 60 characters |
| `description` | string | No | Max 280 characters |
| `visibility` | `'public'` \| `'private'` | No | Default private |

**On success:**
- Fetches `username` from `profiles` via `clerk_id` for `owner_username` denormalization
- Inserts into `clubs` table with `owner_id` (Clerk text ID), `owner_username`, `member_count: 1`
- Calls `redirect('/clubs')` — **does not return**

> **DB note:** `clubs.owner_id` is `text` (stores Clerk user IDs like `user_xxx`). Migration 005 converts it from `uuid` and drops the erroneous FK to `profiles.id`.

**Returns:** `CreateClubState = { error: string | null }`

**Example:**
```tsx
'use client';
import { useActionState } from 'react';
import { createClub } from '@/app/clubs/actions';

const [state, action] = useActionState(createClub, { error: null });

<form action={action}>
  <input name="name" maxLength={60} />
  <textarea name="description" maxLength={280} />
  <select name="visibility">
    <option value="public">Public</option>
    <option value="private">Private</option>
  </select>
  <button type="submit">Create Club</button>
</form>
```

---

## 8. Onboarding Actions

**File:** `src/app/onboarding/actions.ts`
**Directive:** `'use server'`

### `completeOnboarding(_prev, formData): Promise<OnboardingState>`

Finalizes new user setup. Creates `profiles` and `cars` records, then redirects to dashboard.

**FormData fields:**
| Field | Type | Required | Validation |
|---|---|---|---|
| `username` | string | Yes | Min 3 chars, alphanumeric + underscore only, must be unique |
| `bio` | string | No | Free text |
| `make` | string | Yes | Non-empty |
| `model` | string | Yes | Non-empty |
| `year` | string (int) | Yes | 1900 ≤ year ≤ current + 1 |
| `mods` | string | No | Free text |
| `instagram_handle` | string | No | Username without `@` |
| `social_followers` | string (int) | No | Defaults to 0 |

**Flow:**
1. Validates all fields
2. Checks username uniqueness against `profiles.username`
3. Calculates initial `profile_completion` score
4. Inserts into `profiles` and returns UUID
5. Inserts into `cars` using that UUID as `user_id`
6. Calls `redirect('/dashboard')` — **does not return**

**Returns:** `OnboardingState = { error: string | null }`

**Example (called via useActionState in OnboardingForm component):**
```tsx
const [state, action] = useActionState(completeOnboarding, { error: null });
// Form submits all 3 steps' fields together on step 3
```

---

## 9. Realtime Hooks

**File:** `src/hooks/use-community-realtime.ts`
**Directive:** `'use client'`

Two React hooks for Supabase Realtime subscriptions. Both use the **anon client** from `src/lib/supabase/client.ts` (not admin — realtime doesn't need RLS bypass since it reads public data).

---

### `useRealtimeDrops(pitId?: string): UseRealtimeDropsReturn`

Subscribes to `INSERT` events on `public.drops`. Buffers new arrivals and exposes a dismissible banner.

**Parameters:**
- `pitId` — optional pit UUID to scope subscription to one pit only. Omit for global feed.

**Returns:**
```ts
interface UseRealtimeDropsReturn {
  newDrops: Drop[];           // buffered drops not yet shown in feed
  banner: NewDropsBanner | null;  // null when no new drops
}

interface NewDropsBanner {
  count:   number;   // number of new drops waiting
  dismiss: () => void;  // call to clear banner (user should then prepend newDrops to feed)
}
```

**Channel naming:**
- Global: `'drops:all'`
- Scoped: `'drops:pit:<pitId>'`

**Example:**
```tsx
'use client';
import { useRealtimeDrops } from '@/hooks/use-community-realtime';

function Feed({ pitId }: { pitId?: string }) {
  const { newDrops, banner } = useRealtimeDrops(pitId);

  return (
    <>
      {banner && (
        <button onClick={banner.dismiss}>
          {banner.count} new drops — click to load
        </button>
      )}
      {/* Render your drop list here */}
    </>
  );
}
```

---

### `useRealtimeVotes(dropId, initialCounts): UseRealtimeVotesReturn`

Subscribes to `UPDATE` events on `public.drops` for a specific drop, updating vote counts live.

**Parameters:**
- `dropId` — drop UUID to watch
- `initialCounts` — seed values from SSR so first render is correct:
  ```ts
  { revCount: number; idleCount: number; score: number }
  ```

**Returns:**
```ts
interface UseRealtimeVotesReturn {
  revCount:  number;
  idleCount: number;
  score:     number;
}
```

**Re-seeding:** If the parent component refreshes server data (e.g. after `revalidatePath`), the hook re-syncs counts from `initialCounts` via a `useEffect`.

**Channel naming:** `'votes:drop:<dropId>'`

**Example:**
```tsx
'use client';
import { useRealtimeVotes } from '@/hooks/use-community-realtime';

function VoteDisplay({ drop }: { drop: Drop }) {
  const { revCount, idleCount, score } = useRealtimeVotes(drop.id, {
    revCount: drop.rev_count,
    idleCount: drop.idle_count,
    score: drop.score,
  });

  return <span>REV {revCount} · IDLE {idleCount}</span>;
}
```

---

## 10. Middleware

**File:** `src/middleware.ts`

Clerk middleware that handles two concerns:

### Auth Protection
All routes not listed in `isPublicRoute` require authentication via Clerk's `auth.protect()`.

**Public routes:**
- `/` — Landing page
- `/sign-in(.*)` — Clerk sign-in (all sub-paths)
- `/sign-up(.*)` — Clerk sign-up (all sub-paths)
- `/leaderboard(.*)` — Public leaderboard
- `/clubs(.*)` — Public clubs directory
- `/community(.*)` — Public community feed
- `/store(.*)` — Pit Market browse + detail pages (publicly viewable; auth gated at UI level for price/images/actions)

### Pathname Header Proxy
Injects the current request pathname into a **request header** (`x-pathname`) so server components can read it without client-side JavaScript.

```ts
const requestHeaders = new Headers(req.headers);
requestHeaders.set('x-pathname', req.nextUrl.pathname);
return NextResponse.next({ request: { headers: requestHeaders } });
```

**How to read it in a server component:**
```ts
import { headers } from 'next/headers';

const hdrs = await headers();
const pathname = hdrs.get('x-pathname') ?? '/';
```

**Important:** Must use `NextResponse.next({ request: { headers } })` — NOT `res.headers.set(...)`. Response headers are NOT accessible to server components via `headers()`.

**Matcher config:**
```ts
matcher: [
  '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|...)).*)',
  '/(api|trpc)(.*)',
]
```
Skips Next.js internals and static assets; always runs for API routes.

---

## 11. Components

### `AppSidebar`
**File:** `src/components/app-sidebar.tsx`
**Type:** Async Server Component

Shared navigation sidebar used by all authenticated app sections. Fetches its own auth + profile data.

**Used in:** All `layout.tsx` files under `/quests`, `/challenges`, `/community`, `/profile`, `/settings`

**What it does:**
1. Calls `auth()` from Clerk to get `userId`
2. Fetches `{ score, tier, username }` from `profiles` via admin client
3. Reads `x-pathname` from request headers (set by middleware) for active nav state
4. Renders nav links, icons, user score badge

**Nav items:** Dashboard, Leaderboard, Quests, Community, Challenges, Clubs, Profile, Settings

**How to add to a new page:**
```tsx
// src/app/my-page/layout.tsx
import AppSidebar from '@/components/app-sidebar';
import { tokens } from '@/lib/design-tokens';

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: tokens.colors.black }}>
      <AppSidebar />
      <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
```

---

### `LeaderboardTable`
**File:** `src/components/leaderboard-table.tsx`
**Type:** Client Component

Interactive leaderboard rendered as a **card list** (not a table). Features cyberpunk angular `clip-path` cards, top-3 gold styling, elite neon-green tint, search filter, time-range tabs (All Time / This Week / This Month), tier badges, trend arrows, and avatar initials.

**Props:**
```ts
{ rows: LeaderboardRow[] }
```

**`LeaderboardRow` type:**
```ts
type LeaderboardRow = {
  rank:         number;
  id:           string;
  username:     string;
  handle:       string;
  avatarLetter: string;
  carName:      string;
  score:        number;
  tier:         Tier;
};
```

**Card styling rules:**
- Rank 1 → gold avatar ring + gold score + gold rank number
- Rank 2–3 → accent (neon) avatar ring + accent score + accent rank number
- Tier `elite` (rank 4+) → subtle neon tint card background
- All cards: `clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)` angular cut

**Internal state:**
- `query` — search string filtering by `username` or `handle`
- `activeTab` — `'All Time' | 'This Week' | 'This Month'` (filter tabs are UI-only; data not yet filtered by time on the backend)

---

### `CreateClubModal`
**File:** `src/components/create-club-modal.tsx`
**Type:** Client Component

Modal dialog rendered via `createPortal`. Includes club name, description, and visibility (public/private) fields. Uses `useActionState` with `createClub` server action.

**Dismiss:** Escape key or backdrop click.

---

### `OnboardingForm`
**File:** `src/components/onboarding-form.tsx`
**Type:** Client Component

3-step multi-step form: **Step 1** Profile info → **Step 2** Car details → **Step 3** Social links. Progress indicator re-animates on each step via `key={step}`. Final submission calls `completeOnboarding` via `useActionState`.

---

### `QuestCard`
**File:** `src/components/quest-card.tsx`
**Type:** Server/Client Component

Displays a single quest with difficulty color coding, point reward, progress bar, status badge, and submit button for active quests. Renders `QuestCountdown` for active quests with deadlines.

**Status colors:**
- Active → accent `#C8FF00`
- Pending → yellow `#FFD700`
- Completed → grey

---

### `QuestCountdown`
**File:** `src/components/quest-countdown.tsx`
**Type:** Client Component

Live countdown timer using `setInterval` (1s tick). Displays `Xd Xh Xm Xs` remaining. Shows `EXPIRED` when deadline has passed.

**Props:**
```ts
{ deadline: string }  // ISO 8601 date string
```

---

### `QuestSubmitButton`
**File:** `src/components/quest-submit-button.tsx`
**Type:** Client Component

Submit button for active quests. Uses `useActionState` (calls `submitQuest`) and `useFormStatus` for loading state. Displays inline error messages.

**Props:**
```ts
{ questId: string }
```

---

### `SettingsForm`
**File:** `src/components/settings-form.tsx`
**Type:** Client Component

Two independent form sections:
- **ProfileSection** — bio, instagram_handle, social_followers → calls `updateProfile`
- **CarSection** — make, model, year, mods → calls `updateCar`

Each section has its own `useActionState` and a `StatusBanner` that shows success/error feedback. `SubmitBtn` uses `useFormStatus` for disabled state during pending.

**Props:**
```ts
{
  profile: { bio, instagram_handle, social_followers } | null;
  car:     { make, model, year, mods } | null;
}
```

---

### `CommunityFeed`
**File:** `src/components/community/community-feed.tsx`
**Type:** Client Component

Manages feed state and integrates `useRealtimeDrops`. Renders a `NewDropsBanner` when new drops arrive and handles dismiss to prepend them to the visible feed.

**Props:**
```ts
{
  initialDrops:     Drop[];
  pitId?:           string;   // scope realtime subscription to one pit
  isAuthenticated?: boolean;  // default false — threads down to DropCard → VoteButtons
}
```

`isAuthenticated` is computed once at the server page level via Clerk `auth()` and passed down as a prop to avoid running auth checks in every client component.

---

### `DropCard`
**File:** `src/components/community/drop-card.tsx`
**Type:** Client Component

Full drop display: title, body, media gallery, poll options with vote bars, author info with tier badge, tag chips, `VoteButtons`, reply count, share button. Handles build update callout and pinned drop banner.

**Props:**
```ts
{
  drop:             Drop;
  isAuthenticated?: boolean;  // default false — forwarded to VoteButtons
}
```

---

### `SubmitDrop`
**File:** `src/components/community/submit-drop.tsx`
**Type:** Client Component

Multi-type drop submission form. Supports: text, image (drag-and-drop upload to Supabase Storage), video, poll (dynamic option list), build update. Uses `useTransition` for non-blocking submission. Calls `createDrop` server action.

---

### `ReplyThread`
**File:** `src/components/community/reply-thread.tsx`
**Type:** Client Component

Threaded reply display with up to 4 levels of nesting. Features: inline reply composer, Rev button with optimistic UI updates, "Show more replies" expansion for collapsed threads, deleted comment placeholder.

---

### `VoteButtons`
**File:** `src/components/community/vote-buttons.tsx`
**Type:** Client Component

REV / IDLE vote buttons for drops. Uses `useOptimistic` for instant feedback while `voteOnDrop` server action runs in the background. Formats large numbers as `K` (e.g. `1.2K`). Includes ARIA labels for accessibility.

**Props:**
```ts
{
  dropId:           string;
  initialRevCount:  number;
  initialIdleCount: number;
  initialUserVote:  'rev' | 'idle' | null;
  isAuthenticated?: boolean;  // default false
}
```

**Auth-gated behaviour:**
- When `isAuthenticated === false`, clicking REV or IDLE redirects to `/sign-in` via `window.location.href` (no `useRouter` needed in a client component).
- Buttons render at 55% opacity when not authenticated as a visual hint that interaction requires sign-in.
- When authenticated, optimistic update fires immediately and `voteOnDrop` runs in a `useTransition`.

---

### `HeroImage`
**File:** `src/components/landing/hero-image.tsx`
**Type:** Client Component (`'use client'`)

Full-bleed parallax background for the landing page hero section. Renders a free Unsplash automotive image with a dark gradient overlay. On scroll, moves the image at 0.3× speed via `transform: translateY` for depth. Uses `next/image` with `fill` and `unoptimized`.

**Props:** None

**Usage:**
```tsx
// Inside HeroSection, as first child of the <section>
<HeroImage />
```

---

### `RingGauge`
**File:** `src/components/ui/ring-gauge.tsx`
**Type:** Client Component (`'use client'`)

Animated SVG ring gauge that draws from 0 → `value` on mount using a spring-like cubic-bezier transition on `stroke-dashoffset`. Replaces the static `ProfileGauge` in the dashboard.

**Props:**
```ts
{
  value:   number;   // 0–100 percent
  size?:   number;   // outer diameter px (default 86)
  stroke?: number;   // stroke thickness px (default 6)
}
```

**Usage:**
```tsx
<RingGauge value={p.profile_completion} />
```

---

### `SidebarClient`
**File:** `src/components/sidebar-client.tsx`
**Type:** Client Component (`'use client'`)

Interactive sidebar shell. Handles active nav state via `usePathname`, mobile hamburger + overlay, entrance animation (slide from left 300ms), and bottom user profile card. Receives pre-fetched `profile` data from the `AppSidebar` server wrapper.

**Props:**
```ts
{ profile: SidebarProfile }
// SidebarProfile = { username: string; score: number; global_rank: number | null } | null
```

**Logo:**
- Image: `/images/side_nav_logo.png`
- Link href: `/dashboard` when signed in, `/` (landing page) when guest (`profile` is null)

**Nav arrays (auth-gated):**
```ts
// Always visible — no sign-in required
PUBLIC_NAV  = [Leaderboard, Clubs, Community, Pit Market]

// Shown only when profile (user) is non-null
AUTH_NAV    = [Dashboard, My Profile, Quests, Challenges]

// Settings divider + link — only shown when signed in
SETTINGS_NAV = [Settings]
```

**Composition logic:**
```ts
const allMainNav = profile ? [...AUTH_NAV, ...PUBLIC_NAV] : PUBLIC_NAV;
// Settings rendered in a separate block below main nav, only when profile is not null
```

Unauthenticated visitors see only the public nav items and the logo routes to `/`. Authenticated users see Dashboard, Profile, Quests, Challenges first, then the public items, then Settings below a divider, and the logo routes to `/dashboard`.

---

### `PageTransition`
**File:** `src/components/layout/page-transition.tsx`
**Type:** Client Component (`'use client'`)

Wraps page content with a fade-in + 8px slide-up entrance animation (`page-enter` keyframe, 350ms ease-out). Applied to the top-level return of every authenticated page.

**Props:**
```ts
{ children: React.ReactNode }
```

**Usage:**
```tsx
return (
  <PageTransition>
    <div style={{ minHeight: '100vh', backgroundColor: black }}>
      {/* page content */}
    </div>
  </PageTransition>
);
```

---

### `StatNumber`
**File:** `src/components/stat-number.tsx`
**Type:** Client Component (`'use client'`)

Renders an animated count-up number using `useCountUp`. Drop-in replacement for static number spans in stat widgets. Formats with `.toLocaleString()`.

**Props:**
```ts
{
  value:     number;
  style?:    CSSProperties;
  className?: string;
  duration?: number;  // ms, default 1200
  delay?:    number;  // ms, default 0
}
```

**Usage:**
```tsx
<StatNumber value={14280} style={{ fontFamily: mono, fontSize: 38, color: accent }} />
```

---

## 12. Utility Hooks

### `useCountUp`
**File:** `src/hooks/use-count-up.ts`
**Type:** React Hook (`'use client'`)

Animates a number from `start` to `end` on mount using `requestAnimationFrame` with a cubic ease-out curve. Returns the current animated value as a `number`.

**Parameters:**
```ts
{
  start?:    number;  // default 0
  end:       number;
  duration?: number;  // ms, default 1200
  delay?:    number;  // ms before animation starts, default 0
}
```

**Returns:** `number` — current animated value

**Usage:**
```tsx
const score = useCountUp({ end: 14280, duration: 1200 });
return <span>{score.toLocaleString()}</span>;
```

---

## Appendix: Database Schema Quick Reference

| Table | Key Columns |
|---|---|
| `profiles` | `id (uuid)`, `clerk_id`, `username`, `bio`, `avatar_url`, `instagram_handle`, `social_followers`, `quest_completions`, `club_activity`, `global_rank`, `profile_completion`, `score`, `tier`, `community_score` |
| `cars` | `id`, `user_id (FK→profiles.id)`, `make`, `model`, `year`, `mods` |
| `pits` | `id`, `name`, `display_name`, `description`, `member_count` |
| `pit_members` | `id`, `pit_id (FK→pits)`, `user_id (FK→profiles)`, `role` |
| `drops` | `id`, `pit_id`, `author_id`, `title`, `body`, `type`, `media_urls`, `poll_options`, `tag`, `rev_count`, `idle_count`, `score`, `reply_count`, `created_at` |
| `drop_votes` | `id`, `drop_id`, `user_id`, `vote ('rev'\|'idle')` |
| `replies` | `id`, `drop_id`, `author_id`, `parent_reply_id`, `body`, `rev_count`, `created_at` |
| `quests` | `id`, `title`, `description`, `points`, `difficulty`, `deadline`, `category` |
| `user_quests` | `id`, `user_id`, `quest_id`, `status`, `progress`, `submitted_at` |
| `clubs` | `id`, `name`, `description`, `is_public`, `owner_id` **(text — Clerk ID)**, `owner_username`, `member_count` |
| `challenges` | `id`, `title`, `description`, `type`, `points`, `prize`, `banner_url`, `starts_at`, `ends_at`, `is_featured`, `entry_count`, `winner_id` |
| `challenge_entries` | `id`, `challenge_id`, `user_id`, `media_url`, `caption`, `vote_count` |
| `challenge_votes` | `id`, `entry_id`, `user_id` |

---

---

## 12. UI v2 Components (2026-03-17)

### `animations.ts`
**File:** `src/lib/animations.ts`
Single source of truth for all REVPIT motion values. Exports `DURATION`, `EASING`, `STAGGER`, and `TRANSITION` constants.

### `StatCard`
**File:** `src/components/dashboard/stat-card.tsx`
Animated dashboard metric widget. Wraps `StatNumber` (count-up) with mount-scale entrance animation, optional Lucide icon, sub-label, and extra child slot.
- **Props:** `label`, `value`, `prefix?`, `suffix?`, `icon?`, `valueColor?`, `subLabel?`, `delay?`, `children?`

### `TierBadge`
**File:** `src/components/ui/tier-badge.tsx`
Standalone tier pill badge. Zero border-radius, JetBrains Mono, colour-coded per tier (gold=ELITE, lime=PRO, amber=ADVANCED, muted=STARTER).
- **Props:** `tier: Tier | string`, `size?: 'sm' | 'md'`, `className?`

### `Skeleton` / `SkeletonText`
**File:** `src/components/ui/skeleton.tsx`
Shimmer placeholder blocks using the global `shimmer` keyframe. `SkeletonText` renders multi-line text placeholders.
- **Skeleton Props:** `width?`, `height?`, `circle?`, `style?`, `className?`
- **SkeletonText Props:** `lines?: number` (default 2)

### `ToastContainer`
**File:** `src/components/ui/toast.tsx`
Fixed bottom-right toast stack. Renders `toast-in` / `toast-out` animations, 3-colour variants (success/error/info), and auto-dismiss after 3.5s.
- **Props:** `toasts: Toast[]`, `onDismiss: (id: string) => void`

### `useToast`
**File:** `src/hooks/use-toast.ts`
Minimal toast state hook. Returns `{ toasts, toast, dismiss }`.
- **`toast(message, variant?)`** — adds a new toast; variant defaults to `'info'`
- **`dismiss(id)`** — removes toast by id

### Loading skeletons
- `src/app/dashboard/loading.tsx` — score hero + 3 stat card + 2 bottom-grid skeletons (v3 skeleton-v2 class)
- `src/app/leaderboard/loading.tsx` — header + 10 row skeletons (v3 skeleton-v2 class)
- `src/app/community/loading.tsx` — header + tab row + 6 card skeletons (v3 skeleton-v2 class)

---

### `PlayerCard`
**File:** `src/components/ui/player-card.tsx`
**Type:** Client Component (`'use client'`)

FIFA-style player card component for displaying a driver's tier, score, stats, and car. Supports 4 tiers (STARTER/ADVANCED/PRO/ELITE) with distinct color schemes and glows. ELITE tier adds 3D mouse-tracking tilt, hex pattern overlay, shimmer sweep on hover, and diagonal watermark. PRO tier uses lime `#C8FF00` accent. Supports three sizes (sm/md/lg) and an optional floating animation.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `username` | `string` | required | Driver username (displayed uppercased) |
| `handle` | `string` | required | @handle shown below name |
| `score` | `number` | required | Driver score (0–10000 scale) |
| `tier` | `PlayerCardTier` | required | `'STARTER' \| 'ADVANCED' \| 'PRO' \| 'ELITE'` |
| `carName` | `string?` | — | Optional car name shown in mid section |
| `carPhoto` | `string?` | — | Reserved for future image support |
| `stats` | `PlayerCardStats` | required | `{ spd, pwr, skl, clb, rep }` (0–10000 each) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Card size: sm=160px, md=240px, lg=300px wide |
| `animate` | `boolean` | `false` | Enables CSS float animation |

**Return:** Rendered `<div>` card with inline styles; no side effects.

**Usage:**
```tsx
<PlayerCard
  username="SPEEDKING"
  handle="speedking99"
  score={7500}
  tier="PRO"
  carName="Civic Type-R"
  stats={{ spd: 7000, pwr: 6500, skl: 7200, clb: 5000, rep: 8000 }}
  size="md"
  animate
/>
```

---

### `useCountUp`
**File:** `src/lib/hooks/use-count-up.ts`
**Type:** Client Hook (`'use client'`)

Animates a number from 0 to a target value using `requestAnimationFrame` with an ease-out cubic easing function. Supports configurable duration and start delay. Cleans up RAF and timeout on unmount/re-run.

**Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `target` | `number` | required | Final value to count up to |
| `duration` | `number` | `1200` | Animation duration in milliseconds |
| `delay` | `number` | `0` | Delay before animation starts in ms |

**Returns:** `number` — the current animated integer value (0 → target).

**Usage:**
```tsx
const animatedScore = useCountUp(4250, 1000, 200);
// animatedScore counts from 0 to 4250 over 1s, starting after 200ms
```

---

### `ClubDetailPage`
**File:** `src/app/clubs/[id]/page.tsx`
**Type:** Async Server Component

Club detail page at `/clubs/[id]`. Fetches club by UUID, returns 404 via `notFound()` if missing. Shows club name, description, public/private badge, owner badge (for the owner), member count, founding year, and a Join / Request Access button for non-owners.

**Route params:** `id` — club UUID
**Auth:** `auth()` to detect owner — no writes.

---

### `clubs.module.css`
**File:** `src/app/clubs/clubs.module.css`

Scoped CSS for `ClubCard` hover effect (border-color lift, `translateY(-3px)`, box-shadow). Replaces the previous `onMouseEnter`/`onMouseLeave` JS handlers that are invalid in Server Components.

---

---

## 12. Store Actions (Pit Market)

**File:** `src/app/store/actions.ts`

### `createListing`
**Type:** Server Action (`useActionState`)

Creates a new `store_listings` row with `status = 'pending'` (awaits moderation). Reads image URLs from `formData.get('images')` as a JSON array string (max 5 URLs). Fetches the seller's username from `profiles` for denormalized display.

| Param | Type | Notes |
|---|---|---|
| `_prev` | `ListingState` | Previous action state |
| `formData` | `FormData` | `title`, `description`, `price`, `category`, `condition`, `is_exclusive`, `images` |

**Returns:** `ListingState { error: string \| null }`
**Side effects:** `revalidatePath('/store')`, redirects to `/store?submitted=1`

```tsx
const [state, action] = useActionState(createListing, { error: null });
<form action={action}>...</form>
```

---

### `uploadListingImage`
**Type:** Server Action (direct call, not `useActionState`)

Uploads a single image file to the `store-images` Supabase Storage bucket. Called client-side from `NewListingForm` before form submission. Max 5 MB, accepts jpeg/png/webp/gif. Stores at path `{clerkUserId}/{timestamp}_{random}.{ext}`.

| Param | Type | Notes |
|---|---|---|
| `formData` | `FormData` | Must contain `file` key with a `File` object |

**Returns:** `Promise<{ url?: string; error?: string }>`

```tsx
const fd = new FormData();
fd.append('file', fileInput.files[0]);
const { url, error } = await uploadListingImage(fd);
```

---

### `markAsSold`
**Type:** Server Action (direct call)

Sets `is_sold = true` on a listing. Only the seller (matched by `seller_id === userId`) can call this.

| Param | Type |
|---|---|
| `listingId` | `string` (UUID) |

**Returns:** `Promise<{ error?: string }>`
**Side effects:** `revalidatePath('/store')`, `revalidatePath('/store/[id]')`

---

### `deleteListing`
**Type:** Server Action (direct call)

Permanently deletes a listing. Only the seller can call this.

| Param | Type |
|---|---|
| `listingId` | `string` (UUID) |

**Returns:** `Promise<{ error?: string }>`
**Side effects:** `revalidatePath('/store')`, redirects to `/store`

---

## Store Pages

### `StorePage`
**File:** `src/app/store/page.tsx`
**Type:** Async Server Component

Publicly accessible browse page at `/store`. Reads `searchParams` for filtering (`q`, `category`, `condition`, `exclusive`). Calls `auth()` optionally — no redirect for guests. Checks if current user is a member (subscribed or in any club) to determine `isMember`. Queries `store_listings` with `status = 'approved'`. Renders `<StoreListingCard>` grid for all visitors; guest card clicks open `AuthGateModal` instead of navigating to the detail page. Renders `<StoreHeroCTA>` which gates "LIST AN ITEM" behind the modal for guests.

**Route:** `/store?q=&category=merch|car_parts&condition=new|like_new|used&exclusive=1`

**Guest behaviour:** All listings are visible. Clicking a card opens `AuthGateModal`. The "LIST AN ITEM" button also opens the modal instead of navigating to `/store/new`.

---

### `NewListingPage`
**File:** `src/app/store/new/page.tsx`
**Type:** Async Server Component (auth guard) + `NewListingForm` client component

Auth-gated at `/store/new`. Redirects to `/sign-in` if not authenticated. Renders `<NewListingForm>` which handles image uploads and listing submission.

---

### `NewListingForm`
**File:** `src/app/store/new/new-listing-form.tsx`
**Type:** Client Component (`'use client'`)

Form for creating a new listing. Uses `useActionState(createListing, ...)`. Includes `<ImageUploader>` sub-component that calls `uploadListingImage` per file and tracks uploaded URLs in local state. Serialises URLs to JSON in a hidden input before submission. Supports an exclusive toggle (members-only listing).

---

### `ListingDetailPage`
**File:** `src/app/store/[id]/page.tsx`
**Type:** Async Server Component

Publicly accessible detail page at `/store/[id]`. Returns 404 if listing not found or if not approved and the viewer is not the seller. Calls `auth()` optionally — no redirect for guests.

**Access flags computed server-side:**
- `isGuest` — `!userId`
- `isLocked` — `listing.is_exclusive && !isMember`
- `isOwner` — `listing.seller_id === userId`

**Guest gating (isGuest):**
- Image area shows blurred lock overlay labelled "SIGN IN TO VIEW"
- Thumbnails hidden
- Price replaced with "— SIGN IN TO SEE PRICE —"
- Description hidden
- Actions panel replaced with `<GuestDetailActions>` (shows JOIN NOW / SIGN IN modal triggers)

**Member lock gating (isLocked):**
- Image area shows lock overlay labelled "MEMBERS ONLY"
- Thumbnails hidden
- Price replaced with "— MEMBERS ONLY —"
- Description hidden
- `<ListingActions>` renders the locked state UI

**Authenticated non-locked:** Full image gallery, price, description, and `<ListingActions>` (CONTACT SELLER / MARK AS SOLD / DELETE for owner).

---

### `ListingActions`
**File:** `src/app/store/[id]/listing-actions.tsx`
**Type:** Client Component (`'use client'`)

Renders the CTA section on the listing detail page. Shows a payment placeholder "CONTACT SELLER" button for buyers, or "MARK AS SOLD" / "DELETE LISTING" controls for the owner. Shows a members-gate UI for locked exclusive listings.

| Prop | Type |
|---|---|
| `listing` | `StoreListing` |
| `isOwner` | `boolean` |
| `isLocked` | `boolean` |
| `isSold` | `boolean` |

---

## Store Components

### `StoreListingCard`
**File:** `src/components/store-listing-card.tsx`
**Type:** Client Component (`'use client'`)

Card for a single listing shown in the browse grid. Converted to a client component to support auth-gate click interception for guests.

**Guest behaviour (`currentUserId === null`):**
- `handleClick` calls `e.preventDefault()` on the `<Link>` and opens `AuthGateModal`
- Image area shows "SIGN IN TO VIEW" lock overlay
- Footer shows "JOIN TO VIEW →" instead of the price

**Member lock behaviour (`isLocked`):**
- Image area shows "MEMBERS ONLY" lock overlay
- Footer shows "— LOCKED —" instead of the price

**Authenticated behaviour:** Full card navigation to `/store/[id]`, price shown, sold overlay rendered if `is_sold`.

| Prop | Type | Notes |
|---|---|---|
| `listing` | `StoreListing` | Listing data |
| `isMember` | `boolean` | Whether the viewer holds member/subscriber status |
| `currentUserId` | `string \| null` | Clerk userId; `null` for unauthenticated visitors |

---

## Database — Migration 006

**File:** `supabase/migrations/006_store.sql`

New tables and changes:

| Table | Description |
|---|---|
| `store_listings` | Marketplace listings: seller_id (Clerk text), title, description, price, category, condition, images (text[]), is_exclusive, status (pending/approved/rejected), is_sold |
| `club_members` | Maps Clerk user IDs to clubs: club_id (FK → clubs.id), member_id (text Clerk userId), role, joined_at |

**Profiles change:** Adds `is_subscribed boolean DEFAULT false` column.

**Storage:** Creates `store-images` Supabase Storage bucket (public, 5 MB limit, jpeg/png/webp/gif). Adds RLS policies for public read and authenticated upload.

---

## Appendix: Adding New Code — Checklist

When adding a new function, server action, hook, or component to this platform:

1. **Server action?** → Use `createAdminClient()`, validate with `await auth()` first, add `'use server'` directive
---

## 13. Admin Panel + Role System

### `getRoleForUser` / `getCurrentRole` / `requireModerator` / `requireAdmin`
**File:** `src/lib/roles.ts`

Role utilities. `getCurrentRole()` reads from `profiles.role` for the current auth session. Auto-syncs pre-grants from `role_assignments` table by Clerk email on first call if the stored role is 'user'. `requireModerator()` / `requireAdmin()` call `notFound()` if access is insufficient — use in layouts/pages to gate sections.

| Export | Returns |
|---|---|
| `getCurrentRole()` | `Promise<'user' \| 'moderator' \| 'admin'>` |
| `getRoleForUser(userId)` | Same, for an arbitrary Clerk userId |
| `requireModerator()` | `Promise<Role>` — notFound() if not mod/admin |
| `requireAdmin()` | `Promise<void>` — notFound() if not admin |
| `syncUserRole(userId)` | `Promise<void>` — side-effect only (persists role) |

---

### Admin Server Actions
**File:** `src/app/admin/actions.ts`

All actions assert role before executing. Returns `{ error?: string }` or `SetRoleState`.

| Action | Access | Description |
|---|---|---|
| `approveListing(id)` | Mod/Admin | Sets listing status = 'approved' |
| `rejectListing(id)` | Mod/Admin | Sets listing status = 'rejected' |
| `adminDeleteListing(id)` | Mod/Admin | Permanently deletes a listing |
| `adminDeleteDrop(id)` | Mod/Admin | Deletes a community drop |
| `adminDeleteReply(id)` | Mod/Admin | Deletes a reply |
| `setUserRole(prev, formData)` | Admin only | Sets profile.role, upserts role_assignments |
| `grantRoleByEmail(prev, formData)` | Admin only | Pre-grants a role to an email |

---

### Admin Pages

| Page | Path | Access | Description |
|---|---|---|---|
| `AdminLayout` | `src/app/admin/layout.tsx` | Mod/Admin | Gate + sub-nav tabs (Overview / Store / Community / Users) |
| `AdminOverviewPage` | `src/app/admin/page.tsx` | Mod/Admin | Stats grid (users, listings, drops, clubs), alert for pending listings, recent activity feeds |
| `AdminStorePage` | `src/app/admin/store/page.tsx` | Mod/Admin | Filterable table of all listings. Filter by `?status=pending\|approved\|rejected\|all`. Inline approve/reject/delete via `StoreModActions` |
| `StoreModActions` | `src/app/admin/store/store-mod-actions.tsx` | Client | Approve / Reject / Delete buttons for a single listing row |
| `AdminCommunityPage` | `src/app/admin/community/page.tsx` | Mod/Admin | Table of all community drops with delete action |
| `CommunityModActions` | `src/app/admin/community/community-mod-actions.tsx` | Client | Delete button (with confirm) for a drop row |
| `AdminUsersPage` | `src/app/admin/users/page.tsx` | Mod (view) / Admin (edit) | Lists all users, elevated roles, and pre-grant role assignments |
| `SetRoleForm` | `src/app/admin/users/user-role-forms.tsx` | Client | Inline form to change a user's role (admin only) |
| `GrantEmailForm` | `src/app/admin/users/user-role-forms.tsx` | Client | Pre-grant a role to an email address (admin only) |

---

## Database — Migration 007

**File:** `supabase/migrations/007_admin_roles.sql`

| Change | Description |
|---|---|
| `profiles.role` | TEXT DEFAULT 'user' CHECK IN ('user', 'moderator', 'admin') |
| `profiles.email` | TEXT nullable — stored for role lookup |
| `role_assignments` | email (UNIQUE) → role mapping for pre-grants |
| Seed | `brija.main@gmail.com` pre-granted as 'admin' |

**Role sync flow:** On every `getRoleForUser()` call, if profile.role = 'user', the system checks `role_assignments` by email. If a match is found, the profile is promoted and the role is persisted.

---

## Database — Migration 008

**File:** `supabase/migrations/008_admin_logs.sql`

Creates `admin_logs` table — append-only record of every moderation action.

| Column | Type | Description |
|---|---|---|
| `actor_id` | text | Clerk userId of who acted |
| `actor_username` | text | Denormalised username at time of action |
| `actor_email` | text | Denormalised email at time of action |
| `actor_role` | text | Role at time of action (admin / moderator) |
| `action` | text | Enum: APPROVE_LISTING, REJECT_LISTING, DELETE_LISTING, DELETE_DROP, DELETE_REPLY, SET_ROLE, GRANT_ROLE_BY_EMAIL |
| `target_type` | text | listing / drop / reply / user |
| `target_id` | text | UUID of the target row |
| `target_label` | text | Human-readable description |
| `created_at` | timestamptz | Indexed DESC for fast log queries |

---

### `logAction` (internal helper)
**File:** `src/app/admin/actions.ts`

Private async helper called at the end of every admin/mod action. Fetches the actor's `username`, `email`, and `role` from `profiles` and inserts a row into `admin_logs`. Never throws — log failures do not block the action.

---

### `AdminLogsPage`
**File:** `src/app/admin/logs/page.tsx`
**Type:** Async Server Component

Action log page at `/admin/logs`. Shows all moderation actions in reverse-chronological order with:
- **Actor:** username (linked to filtered view), email, role badge
- **Action:** colour-coded badge per action type
- **Target:** human-readable description + target type
- **When:** relative time (e.g. "3h ago") with tooltip of exact timestamp

Supports `?actor=username` and `?action=ACTION_KEY` query filters. Shows a **top actors summary** strip of up to 6 moderators with action counts. Moderators cannot access the Users tab to change roles (UI gated by `isAdmin` + server actions guarded by `assertAdmin()`).

---

### Moderator role-change protection
All role-altering actions (`setUserRole`, `grantRoleByEmail`) call `assertAdmin()` which throws with message "Admin access required. Moderators cannot alter roles." on any non-admin attempt. This is enforced at the server action level regardless of what the UI shows.

---

### `AuthGateModal`
**File:** `src/components/auth-gate-modal.tsx`
**Type:** Client Component (`'use client'`)

Portal-based modal overlay displayed when unauthenticated users attempt to access gated store content. Locks body scroll and closes on Escape or backdrop click.

**Props:** `isOpen: boolean`, `onClose: () => void`
**Renders:** Lock icon, "JOIN TO VIEW FULL DETAILS" heading, 4 perks list, JOIN NOW (→ `/sign-up`) and SIGN IN (→ `/sign-in`) CTA buttons.
**Usage:** Used by `StoreListingCard`, `StoreHeroCTA`, and `GuestDetailActions`.

---

### `StoreHeroCTA`
**File:** `src/app/store/store-hero-cta.tsx`
**Type:** Client Component (`'use client'`)

Renders the "LIST AN ITEM" button in the store hero. If `userId` is null (guest), clicking the button opens `AuthGateModal` instead of navigating. Also renders the members-only filter chip if `isMember` is true.

**Props:** `userId: string | null`, `isMember: boolean`, `exclusiveOnly: boolean`

---

### `GuestDetailActions`
**File:** `src/app/store/[id]/guest-detail-actions.tsx`
**Type:** Client Component (`'use client'`)

Replaces `ListingActions` on the detail page when the user is not authenticated. Shows a sign-up/sign-in panel that opens `AuthGateModal` on click.

**Props:** none
**Usage:** Rendered by `src/app/store/[id]/page.tsx` when `isGuest` is true.

---

### Store public access (middleware)
`/store(.*)` added to `isPublicRoute` in `src/middleware.ts`. The store listing grid and individual listing pages are now publicly accessible. Authentication is enforced at the UI level: card clicks open `AuthGateModal`, and detail pages gate price/description/images/actions for guests.

---

### `AdminTabs`
**File:** `src/app/admin/admin-tabs.tsx`
**Type:** Client Component (`'use client'`)

Sub-navigation tab bar for the admin panel. Uses `usePathname()` from `next/navigation` to determine the active tab on every client-side navigation. Replaces the previous server-component approach (reading `x-pathname` header) which only ran on initial page load and kept Overview permanently highlighted on subsequent navigations.

**Props:** none
**Tabs rendered:** Overview, Store, Community, Users, Action Log
**Usage:** Rendered inside `src/app/admin/layout.tsx`.

---

### `StoreSection` (landing page)
**File:** `src/app/page.tsx`
**Type:** Server Component function

PIT MARKET showcase section on the public landing page. Displays three sample store item cards (merch + car parts), category/exclusive-drop feature tags, Stripe/PayPal placeholder badges, and two CTAs: **START SELLING** (→ `/sign-up`) and **BROWSE STORE** (→ `/store`). No DB queries — purely marketing content.

Also updated in the same file:
- Navbar nav links now include **STORE**
- Footer Platform links now include **Store**

---

## 2. Supabase Admin Client
**File:** `src/lib/supabase/admin.ts`
**Note:** All server-side DB access must use `createAdminClient()`. Never use `createClient()` from server.ts.

---

2. **Server component with DB?** → Use `createAdminClient()`, never `createClient()` from server.ts
3. **Client component?** → Add `'use client'` directive; use `useActionState` for forms, `useOptimistic` for instant UI
4. **New page?** → Create a `layout.tsx` in the same folder that wraps `<AppSidebar />` + `<main>`
5. **New nav item?** → Add to `NAV_ITEMS` array in `src/components/app-sidebar.tsx`
6. **New DB table?** → Create a new migration file in `supabase/migrations/` using `CREATE TABLE IF NOT EXISTS` and idempotent `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` backfills
7. **Update this file** → Add the new function/hook/component to the relevant section above
