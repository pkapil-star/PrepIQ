-- PrepIQ schema for the job-title-first flow (PRD.md, 2026-10-05). Run in the Supabase SQL editor.
-- Re-runnable: drops the old company-first tables, keeps `companies` and its seeded rows.

drop table if exists revision_plans, user_skill_ratings, role_topic_weightage,
  interview_experiences, roles cascade;

create table if not exists companies (
  id bigint generated always as identity primary key,
  name text not null unique,
  industry text
);

create table if not exists job_titles (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null
);

insert into job_titles (slug, name) values
  ('sde', 'SDE / Software Engineer'),
  ('fde', 'Forward Deployed Engineer'),
  ('cloud', 'Cloud Engineer'),
  ('cyber', 'Cybersecurity Engineer'),
  ('web', 'Frontend / Backend / Full-stack'),
  ('data-ml', 'Data / ML Engineer'),
  ('devops', 'DevOps / SRE'),
  ('qa', 'QA / SDET')
on conflict (slug) do nothing;

-- level orders the roadmap beginner -> advanced; est_hours sizes it into weeks.
create table if not exists topics (
  id bigint generated always as identity primary key,
  name text not null unique,
  subject text not null check (subject in ('DSA', 'OS', 'DBMS', 'CN', 'OOP', 'Role-specific')),
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  est_hours numeric not null check (est_hours > 0)
);

-- Experience buckets, used as plain text in the tables below:
--   student_new, student_interviewed, student_intern, work_1_2, work_2_4, work_4plus

-- Curated baseline weight of each topic per job title x experience bucket.
create table if not exists baseline_weights (
  job_title_id bigint not null references job_titles(id) on delete cascade,
  experience_bucket text not null check (experience_bucket in
    ('student_new', 'student_interviewed', 'student_intern', 'work_1_2', 'work_2_4', 'work_4plus')),
  topic_id bigint not null references topics(id) on delete cascade,
  weight numeric not null check (weight >= 0 and weight <= 1),
  primary key (job_title_id, experience_bucket, topic_id)
);

-- Company adjustment, extracted from real interview posts.
create table if not exists company_topic_weights (
  company_id bigint not null references companies(id) on delete cascade,
  job_title_id bigint not null references job_titles(id) on delete cascade,
  topic_id bigint not null references topics(id) on delete cascade,
  weight numeric not null check (weight >= 0 and weight <= 1),
  source_count int not null default 1,
  primary key (company_id, job_title_id, topic_id)
);

create table if not exists interview_experiences (
  id bigint generated always as identity primary key,
  company_id bigint references companies(id) on delete cascade,
  job_title_id bigint references job_titles(id) on delete cascade,
  raw_text text not null,
  source_url text,
  date_posted date
);

-- users live in Supabase Auth (auth.users).
create table if not exists user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  experience_bucket text not null check (experience_bucket in
    ('student_new', 'student_interviewed', 'student_intern', 'work_1_2', 'work_2_4', 'work_4plus')),
  job_title_id bigint not null references job_titles(id),
  company_id bigint references companies(id),
  weeks int not null check (weeks between 1 and 52),
  hours_per_day numeric not null check (hours_per_day > 0 and hours_per_day <= 16),
  updated_at timestamptz not null default now()
);

-- Self-assessment rating + progress. completed_at older than 30 days = flagged for revision.
create table if not exists user_topics (
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id bigint not null references topics(id) on delete cascade,
  self_rating numeric not null default 0 check (self_rating >= 0 and self_rating <= 1),
  completed_at timestamptz,
  primary key (user_id, topic_id)
);

create table if not exists roadmaps (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  generated_at timestamptz not null default now(),
  roadmap_json jsonb not null
);
