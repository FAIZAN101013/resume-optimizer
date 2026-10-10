-- =============================================================================
-- Records that the welcome email has been sent, so it can only go out once.
-- Idempotent: safe to run more than once.
-- =============================================================================

alter table public.profiles
  add column if not exists welcome_email_sent_at timestamptz;

comment on column public.profiles.welcome_email_sent_at is
  'Set by api/send-welcome.js the first time the welcome email is delivered. '
  'Null means it has not been sent yet.';
