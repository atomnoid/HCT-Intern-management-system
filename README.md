# Intern Task & Progress Tracker

Production-oriented internal task tracker for leads to manage interns, built with Next.js, TypeScript, Tailwind CSS, Supabase Auth, PostgreSQL, RLS, and workflow RPCs.

## Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Apply migrations in `supabase/migrations`.
4. Create a lead user through the app signup page.
5. Add interns from the app's Interns page. Interns are managed records and do not need login accounts.
6. Run the app:

```bash
npm install
npm run dev
```

## Verification

```bash
npm run typecheck
npm run lint
npm run build
```

## Security Model

- Supabase Auth owns lead identity.
- `profiles` stores authenticated lead profiles and lead-managed intern records.
- RLS is enabled on every application table.
- Intern records are created by leads and used for assignment/workload tracking.
- Sensitive workflows use RPC functions:
  - `create_task_with_activity`
  - `update_task_progress`
  - `report_task_blocker`
  - `resolve_task_blocker`
  - `submit_task_for_review`
  - `review_task_submission`

The frontend never trusts client-supplied role state for authorization.
