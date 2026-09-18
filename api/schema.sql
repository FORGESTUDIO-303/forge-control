-- Forge Control schema (Neon Postgres)
create table if not exists devices (
  id serial primary key,
  name text not null,
  detail text default '',
  is_on boolean default true,
  created_at timestamptz default now()
);
create table if not exists fan_profiles (
  id serial primary key,
  name text not null,
  cpu_fan int default 40,
  gpu_fan int default 40,
  chassis1 int default 30,
  chassis2 int default 30,
  created_at timestamptz default now()
);
create table if not exists lighting_presets (
  id serial primary key,
  name text not null,
  color text default '#ff0033',
  effect text default 'Static',
  brightness int default 90,
  created_at timestamptz default now()
);
-- auth placeholders for next steps (Google/GitHub)
create table if not exists users (
  id serial primary key,
  email text unique,
  name text,
  provider text default 'local',
  provider_id text,
  created_at timestamptz default now()
);
