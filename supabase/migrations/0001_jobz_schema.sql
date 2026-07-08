-- =============================================================================
-- JोBz — Core schema, RLS, storage
-- =============================================================================
-- Idempotent: safe to run more than once, and safe against the existing
-- `jobs` / `profiles` tables. Existing rows are preserved; legacy columns are
-- renamed in place (role -> title, date -> application_date) so no data is lost.
--
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Extensions + shared helpers
-- -----------------------------------------------------------------------------

create extension if not exists "pgcrypto";

-- Keeps updated_at honest without the client having to remember.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- =============================================================================
-- 1. PROFILES
-- =============================================================================
-- `id` is the auth user id (this is how the existing code already reads it, so
-- we keep that shape rather than adding a redundant user_id column).

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade
);

alter table public.profiles add column if not exists full_name    text;
alter table public.profiles add column if not exists email        text;
alter table public.profiles add column if not exists phone        text;
alter table public.profiles add column if not exists location     text;
alter table public.profiles add column if not exists job_title    text;   -- professional headline
alter table public.profiles add column if not exists bio          text;
alter table public.profiles add column if not exists github       text;
alter table public.profiles add column if not exists linkedin     text;
alter table public.profiles add column if not exists portfolio    text;
alter table public.profiles add column if not exists avatar_url   text;
alter table public.profiles add column if not exists open_to_work boolean not null default true;

-- Resume-shaped data. JSONB (not child tables) because every consumer
-- — Resume Optimizer, cover letters, interview prep — reads the whole profile
-- as one document, and saves are atomic.
alter table public.profiles add column if not exists skills         text[]  not null default '{}';
alter table public.profiles add column if not exists education      jsonb   not null default '[]'::jsonb;
alter table public.profiles add column if not exists experience     jsonb   not null default '[]'::jsonb;
alter table public.profiles add column if not exists projects       jsonb   not null default '[]'::jsonb;
alter table public.profiles add column if not exists certifications jsonb   not null default '[]'::jsonb;

alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();


-- =============================================================================
-- 2. JOBS
-- =============================================================================

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade
);

-- --- legacy column renames (only fire if the old name is still there) --------

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'jobs' and column_name = 'role'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'jobs' and column_name = 'title'
  ) then
    alter table public.jobs rename column "role" to title;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'jobs' and column_name = 'date'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'jobs' and column_name = 'application_date'
  ) then
    alter table public.jobs rename column "date" to application_date;
  end if;
end $$;

-- --- columns ----------------------------------------------------------------

alter table public.jobs add column if not exists company          text;
alter table public.jobs add column if not exists title            text;
alter table public.jobs add column if not exists url              text;
alter table public.jobs add column if not exists location         text;
alter table public.jobs add column if not exists work_type        text;
alter table public.jobs add column if not exists salary           text;
alter table public.jobs add column if not exists description      text;   -- the job description: the spine of every AI feature
alter table public.jobs add column if not exists status           text not null default 'Saved';
alter table public.jobs add column if not exists application_date date;
alter table public.jobs add column if not exists notes            text;
alter table public.jobs add column if not exists recruiter_name   text;
alter table public.jobs add column if not exists recruiter_email  text;
alter table public.jobs add column if not exists source           text;
alter table public.jobs add column if not exists priority         text not null default 'Medium';

-- Legacy columns kept so existing rows keep their data. Harmless if unused.
alter table public.jobs add column if not exists company_email  text;
alter table public.jobs add column if not exists is_referral    boolean default false;
alter table public.jobs add column if not exists referral_email text;

alter table public.jobs add column if not exists created_at timestamptz not null default now();
alter table public.jobs add column if not exists updated_at timestamptz not null default now();

-- --- constraints ------------------------------------------------------------
-- Backfill anything outside the allowed set first, or the constraint won't take.

update public.jobs
   set status = 'Applied'
 where status is null
    or status not in ('Saved','Applied','Screening','Interview','Offer','Rejected','Withdrawn');

update public.jobs
   set priority = 'Medium'
 where priority is null
    or priority not in ('Low','Medium','High');

update public.jobs
   set work_type = null
 where work_type is not null
   and work_type not in ('On-site','Hybrid','Remote');

alter table public.jobs drop constraint if exists jobs_status_check;
alter table public.jobs add  constraint jobs_status_check
  check (status in ('Saved','Applied','Screening','Interview','Offer','Rejected','Withdrawn'));

alter table public.jobs drop constraint if exists jobs_priority_check;
alter table public.jobs add  constraint jobs_priority_check
  check (priority in ('Low','Medium','High'));

alter table public.jobs drop constraint if exists jobs_work_type_check;
alter table public.jobs add  constraint jobs_work_type_check
  check (work_type is null or work_type in ('On-site','Hybrid','Remote'));

create index if not exists jobs_user_id_idx    on public.jobs (user_id);
create index if not exists jobs_status_idx     on public.jobs (user_id, status);
create index if not exists jobs_created_at_idx on public.jobs (user_id, created_at desc);

drop trigger if exists jobs_set_updated_at on public.jobs;
create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();


-- =============================================================================
-- 3. JOB_ACTIVITIES  (application timeline)
-- =============================================================================

create table if not exists public.job_activities (
  id            uuid primary key default gen_random_uuid(),
  job_id        uuid not null references public.jobs(id)      on delete cascade,
  user_id       uuid not null references auth.users(id)       on delete cascade,
  activity_type text not null,
  description   text,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists job_activities_job_id_idx  on public.job_activities (job_id, created_at desc);
create index if not exists job_activities_user_id_idx on public.job_activities (user_id, created_at desc);

-- The timeline is written by the database, not the client, so it can never
-- drift from the actual job rows.
create or replace function public.log_job_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.job_activities (job_id, user_id, activity_type, description, metadata)
    values (
      new.id, new.user_id, 'created',
      'Application created for ' || coalesce(new.title, 'role') || ' at ' || coalesce(new.company, 'company'),
      jsonb_build_object('status', new.status)
    );

  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into public.job_activities (job_id, user_id, activity_type, description, metadata)
    values (
      new.id, new.user_id, 'status_changed',
      'Status changed from ' || old.status || ' to ' || new.status,
      jsonb_build_object('from', old.status, 'to', new.status)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists jobs_log_insert on public.jobs;
create trigger jobs_log_insert
  after insert on public.jobs
  for each row execute function public.log_job_activity();

drop trigger if exists jobs_log_status_change on public.jobs;
create trigger jobs_log_status_change
  after update on public.jobs
  for each row execute function public.log_job_activity();


-- =============================================================================
-- 4. RESUMES
-- =============================================================================
-- The uploaded original is never mutated: raw_text + file_url hold it verbatim,
-- while `content` holds the parsed/edited structured sections.

create table if not exists public.resumes (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users(id) on delete cascade,
  name                   text not null default 'Untitled resume',
  target_role            text,
  target_job_description text,
  source_job_id          uuid references public.jobs(id) on delete set null,
  content                jsonb not null default '{}'::jsonb,  -- parsed sections (editable)
  raw_text               text,                                -- original extracted text (never overwritten)
  file_url               text,                                -- original upload in storage
  file_name              text,
  file_type              text,
  ai_score               integer,
  is_default             boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists resumes_user_id_idx on public.resumes (user_id, updated_at desc);

drop trigger if exists resumes_set_updated_at on public.resumes;
create trigger resumes_set_updated_at
  before update on public.resumes
  for each row execute function public.set_updated_at();


-- =============================================================================
-- 5. RESUME_ANALYSES
-- =============================================================================

create table if not exists public.resume_analyses (
  id                   uuid primary key default gen_random_uuid(),
  resume_id            uuid not null references public.resumes(id) on delete cascade,
  user_id              uuid not null references auth.users(id)     on delete cascade,
  job_id               uuid references public.jobs(id) on delete set null,
  job_description      text not null,
  overall_score        integer,
  ats_score            integer,
  score_reasoning      text,
  matched_keywords     jsonb not null default '[]'::jsonb,
  missing_keywords     jsonb not null default '[]'::jsonb,
  recommended_keywords jsonb not null default '[]'::jsonb,
  missing_skills       jsonb not null default '[]'::jsonb,
  suggestions          jsonb not null default '[]'::jsonb,
  breakdown            jsonb not null default '{}'::jsonb,  -- per-dimension sub-scores
  created_at           timestamptz not null default now()
);

create index if not exists resume_analyses_resume_idx on public.resume_analyses (resume_id, created_at desc);
create index if not exists resume_analyses_user_idx   on public.resume_analyses (user_id, created_at desc);


-- =============================================================================
-- 6. INTERVIEWS
-- =============================================================================

create table if not exists public.interviews (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  job_id           uuid references public.jobs(id) on delete set null,
  company          text,
  position         text,
  interview_type   text not null default 'Video',
  scheduled_at     timestamptz,
  duration_minutes integer default 60,
  interviewer      text,
  meeting_url      text,
  notes            text,
  prep_notes       text,
  prep_material    jsonb not null default '{}'::jsonb,  -- AI-generated question sets
  status           text not null default 'Scheduled',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.interviews drop constraint if exists interviews_type_check;
alter table public.interviews add  constraint interviews_type_check
  check (interview_type in ('Phone','Video','Technical','HR','Behavioral','Final'));

alter table public.interviews drop constraint if exists interviews_status_check;
alter table public.interviews add  constraint interviews_status_check
  check (status in ('Scheduled','Completed','Cancelled','Rescheduled'));

create index if not exists interviews_user_idx      on public.interviews (user_id, scheduled_at);
create index if not exists interviews_job_idx       on public.interviews (job_id);

drop trigger if exists interviews_set_updated_at on public.interviews;
create trigger interviews_set_updated_at
  before update on public.interviews
  for each row execute function public.set_updated_at();


-- =============================================================================
-- 7. AI_EMAILS
-- =============================================================================

create table if not exists public.ai_emails (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  job_id     uuid references public.jobs(id) on delete set null,
  email_type text not null,
  recipient  text,
  subject    text,
  content    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_emails drop constraint if exists ai_emails_type_check;
alter table public.ai_emails add  constraint ai_emails_type_check
  check (email_type in (
    'followup','thankyou','interview_confirmation','interview_reschedule',
    'withdrawal','recruiter_outreach','status_inquiry'
  ));

create index if not exists ai_emails_user_idx on public.ai_emails (user_id, created_at desc);

drop trigger if exists ai_emails_set_updated_at on public.ai_emails;
create trigger ai_emails_set_updated_at
  before update on public.ai_emails
  for each row execute function public.set_updated_at();


-- =============================================================================
-- 8. REMINDERS  (groundwork for notifications — §15)
-- =============================================================================

create table if not exists public.reminders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  job_id        uuid references public.jobs(id)       on delete cascade,
  interview_id  uuid references public.interviews(id) on delete cascade,
  reminder_type text not null,
  title         text not null,
  body          text,
  due_at        timestamptz not null,
  is_read       boolean not null default false,
  is_sent       boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists reminders_user_due_idx on public.reminders (user_id, due_at) where is_read = false;


-- =============================================================================
-- 9. ROW LEVEL SECURITY
-- =============================================================================
-- Every table is user-scoped. Without this the anon key would read everything,
-- because the client queries do not filter by user_id.

alter table public.profiles       enable row level security;
alter table public.jobs           enable row level security;
alter table public.job_activities enable row level security;
alter table public.resumes        enable row level security;
alter table public.resume_analyses enable row level security;
alter table public.interviews     enable row level security;
alter table public.ai_emails      enable row level security;
alter table public.reminders      enable row level security;

-- profiles: keyed on id, not user_id
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- everything else: keyed on user_id, identical shape
do $$
declare
  t text;
begin
  foreach t in array array[
    'jobs','job_activities','resumes','resume_analyses',
    'interviews','ai_emails','reminders'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', t || '_select_own', t);
    execute format(
      'create policy %I on public.%I for select using (auth.uid() = user_id)',
      t || '_select_own', t);

    execute format('drop policy if exists %I on public.%I', t || '_insert_own', t);
    execute format(
      'create policy %I on public.%I for insert with check (auth.uid() = user_id)',
      t || '_insert_own', t);

    execute format('drop policy if exists %I on public.%I', t || '_update_own', t);
    execute format(
      'create policy %I on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      t || '_update_own', t);

    execute format('drop policy if exists %I on public.%I', t || '_delete_own', t);
    execute format(
      'create policy %I on public.%I for delete using (auth.uid() = user_id)',
      t || '_delete_own', t);
  end loop;
end $$;


-- =============================================================================
-- 10. AUTO-CREATE PROFILE ON SIGNUP
-- =============================================================================
-- More reliable than creating it client-side: a Google OAuth user who never
-- opens /profile still gets a row, and we capture their name/avatar.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for users who already signed up.
insert into public.profiles (id, email, full_name, avatar_url)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  u.raw_user_meta_data->>'avatar_url'
from auth.users u
on conflict (id) do nothing;

-- Fill in emails on any pre-existing profile rows that predate the email column.
update public.profiles p
   set email = u.email
  from auth.users u
 where u.id = p.id
   and p.email is null;


-- =============================================================================
-- 11. STORAGE
-- =============================================================================
-- avatars: public read (they render in <img> tags).
-- resumes: private — owner only.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- Convention for both buckets: files live under `<user_id>/<filename>`,
-- so the first path segment is the ownership check.

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "resumes_select_own" on storage.objects;
create policy "resumes_select_own" on storage.objects
  for select using (
    bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "resumes_insert_own" on storage.objects;
create policy "resumes_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "resumes_update_own" on storage.objects;
create policy "resumes_update_own" on storage.objects
  for update using (
    bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "resumes_delete_own" on storage.objects;
create policy "resumes_delete_own" on storage.objects
  for delete using (
    bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text
  );


-- =============================================================================
-- 12. BACKFILL
-- =============================================================================
-- Existing jobs predate the activity trigger, so give them a timeline entry.

insert into public.job_activities (job_id, user_id, activity_type, description, metadata, created_at)
select
  j.id,
  j.user_id,
  'created',
  'Application created for ' || coalesce(j.title, 'role') || ' at ' || coalesce(j.company, 'company'),
  jsonb_build_object('status', j.status, 'backfilled', true),
  j.created_at
from public.jobs j
where not exists (
  select 1 from public.job_activities a where a.job_id = j.id
);
