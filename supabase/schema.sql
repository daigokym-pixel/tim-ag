-- Tim代理店研修 データベース（tim-sales と同じプロジェクトに、頭に ag_ を付けて作る）
create table if not exists ag_members (
  id uuid primary key default gen_random_uuid(),
  line_user_id text unique not null,
  name text not null default '',
  picture text,
  status text not null default 'pending' check (status in ('pending','approved','blocked')),
  role text not null default 'member' check (role in ('member','staff','owner')),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

-- 研修の進み具合・ワークの回答・自己分析・採点などを、メンバーごとに1行で持つ
create table if not exists ag_state (
  member_id uuid primary key references ag_members(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ブラウザから直接は読めないようにする（サイトのサーバーだけがアクセスする）
alter table ag_members enable row level security;
alter table ag_state enable row level security;

-- サイトのサーバー（service_role）が読み書きできるようにする
grant select, insert, update, delete on table ag_members to service_role;
grant select, insert, update, delete on table ag_state to service_role;
