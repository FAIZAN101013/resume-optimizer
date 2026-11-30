-- =============================================================================
-- Keep-alive target for the GitHub Action.
--
-- Six green anon-key REST reads (17 Aug – 3 Sep) did not stop the project
-- pausing on ~6 Sep: cheap anonymous reads evidently do not reset Supabase's
-- inactivity timer. The Action therefore performs a WRITE — an insert and a
-- cleanup delete — which is unambiguous database activity.
--
-- RLS is enabled with NO policies on purpose: the anon and authenticated
-- roles cannot touch this table at all. Only the service_role key (which
-- bypasses RLS and lives solely in GitHub Actions secrets) can write here,
-- so this adds zero publicly writable surface.
--
-- Idempotent: safe to run more than once.
-- =============================================================================

create table if not exists public.keepalive (
  id        bigint generated always as identity primary key,
  pinged_at timestamptz not null default now(),
  note      text check (char_length(note) <= 40)
);

alter table public.keepalive enable row level security;

comment on table public.keepalive is
  'Written twice by .github/workflows/keep-supabase-alive.yml (insert + cleanup) '
  'so the free-tier project registers real activity. Service role only; '
  'no RLS policies exist, so client keys cannot read or write it.';
