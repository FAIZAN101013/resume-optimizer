# Database

## Running the migration

1. Open your Supabase project → **SQL Editor** → **New query**
2. Paste the whole contents of `migrations/0001_jobz_schema.sql`
3. **Run**

It is idempotent — safe to run again if it fails partway or you change something.

## What it does

**Renames** (existing rows keep their data):

| Before | After              |
| ------ | ------------------ |
| `role` | `title`            |
| `date` | `application_date` |

**Adds to `jobs`:** `url`, `location`, `work_type`, `salary`, `description`,
`recruiter_name`, `recruiter_email`, `source`, `priority`, `updated_at`.

`description` is the important one — the job description is what Resume
Optimizer, interview prep, and email generation all read from.

**New tables:** `job_activities`, `resumes`, `resume_analyses`, `interviews`,
`ai_emails`, `reminders`.

**Constraints:** status is now one of Saved / Applied / Screening / Interview /
Offer / Rejected / Withdrawn. Any row with a status outside that set is
rewritten to `Applied` before the constraint is applied, so nothing errors.

**RLS** on all eight user-owned tables. Every table gets the same four policies
(select/insert/update/delete, own rows only).

**Triggers:**

- `job_activities` rows are written by the database on job insert and on every
  status change, so the timeline can't drift from reality.
- A profile row is created automatically when a user signs up, including
  name/avatar from Google OAuth. Existing users are backfilled.
- `updated_at` maintained automatically.

**Storage buckets:** `avatars` (public read, owner write) and `resumes`
(private, owner only). Both expect files at `<user_id>/<filename>` — the first
path segment is what the policy checks.

## Verifying it worked

Run this after the migration. Every table should show `rowsecurity = true`:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

Check the policies exist (expect 4 per table):

```sql
select tablename, count(*) as policies
from pg_policies
where schemaname = 'public'
group by tablename
order by tablename;
```

Confirm the `jobs` columns:

```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'jobs'
order by ordinal_position;
```

## Keep in sync

`src/lib/constants.js` mirrors the CHECK constraints (statuses, priorities,
work types, interview types, email types). If you change one, change the other
or inserts will start failing.
