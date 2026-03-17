# REVPIT — Claude Code Rules

## MANDATORY: Documentation Update Rule

The REVPIT platform has a function reference guide located at:

```
c:\Users\SEN VON DOOM\OneDrive\Desktop\RVP_Proj\Revpit-V1\functions-guide.md
```

**You MUST update this file whenever you:**
- Create a new server action (function in an `actions.ts` file)
- Create a new React hook
- Create a new component in `src/components/`
- Create a new page (`page.tsx`) or layout (`layout.tsx`)
- Add a new exported function to any `src/lib/` file
- Create a new database migration with new tables or columns

**What to add to the guide:**
- The function/hook/component name
- File path
- What it does (1–2 sentences)
- All parameters with types
- Return type / return value
- Side effects (revalidatePath, redirects, DB writes)
- A short usage example

**Update the "Last updated" date at the top of the file** when making changes.

This rule is non-negotiable. Do not skip it. The docs must stay in sync with the code.

---

## Project Essentials

- **Working dir:** `revpit/` (the Next.js app is inside `Revpit-V1/revpit/`)
- **DB client:** ALWAYS use `createAdminClient()` from `src/lib/supabase/admin.ts` for ALL server-side DB access. Never use `createClient()` from `server.ts` or `client.ts` in server contexts.
- **Auth:** Clerk v7 — validate with `await auth()` before any write operation in server actions
- **Forms:** React 19 `useActionState` + `useFormStatus`
- **Styling:** Inline styles using `tokens` from `src/lib/design-tokens.ts` + CSS Modules for animations/hover/responsive
- **Sidebar:** All authenticated pages need a `layout.tsx` wrapping `<AppSidebar />` + `<main>`
- **Migrations:** All SQL must be idempotent — use `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `DO $$ begin if not exists...`
