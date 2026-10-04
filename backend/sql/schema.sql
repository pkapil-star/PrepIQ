-- Core tables per ARCHITECTURE.md "Core Database Tables". Run once in the Supabase SQL editor.

create table companies (
  id bigint generated always as identity primary key,
  name text not null,
  industry text
);

create table roles (
  id bigint generated always as identity primary key,
  company_id bigint not null references companies(id) on delete cascade,
  title text not null,
  experience_level text not null check (experience_level in ('fresher', '1-3_yoe', '4plus_yoe'))
);

create table topics (
  id bigint generated always as identity primary key,
  name text not null unique,
  category text
);

create table role_topic_weightage (
  role_id bigint not null references roles(id) on delete cascade,
  topic_id bigint not null references topics(id) on delete cascade,
  weight numeric not null check (weight >= 0 and weight <= 1),
  round_type text,
  source_count int default 1,
  primary key (role_id, topic_id)
);

create table interview_experiences (
  id bigint generated always as identity primary key,
  company_id bigint references companies(id) on delete cascade,
  role_id bigint references roles(id) on delete cascade,
  raw_text text not null,
  source_url text,
  date_posted date
);

-- users table is managed by Supabase Auth (auth.users); user_skill_ratings references it directly.

create table user_skill_ratings (
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id bigint not null references topics(id) on delete cascade,
  self_rating numeric not null check (self_rating >= 0 and self_rating <= 1),
  last_reviewed_at timestamptz,
  primary key (user_id, topic_id)
);

create table revision_plans (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id bigint not null references roles(id) on delete cascade,
  generated_at timestamptz not null default now(),
  plan_json jsonb not null
);
