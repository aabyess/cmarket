-- 지원센터(공지/자료실/1:1 문의) 기능 코드는 있었지만 테이블이 생성된 적이 없어
-- "Could not find the table 'public.notices'"로 전부 실패하고 있었다 (2026-08-21 발견).
-- 코드(features/support, app/api/admin|support)가 기대하는 스키마 그대로 생성한다.
-- 실제 적용은 사용자가 SQL Editor에서 완료 — 이 파일은 이력 기록용.

create table if not exists public.notices (
	id uuid primary key default gen_random_uuid(),
	title text not null,
	content text not null,
	is_pinned boolean not null default false,
	published_at timestamptz,
	view_count integer not null default 0,
	created_by uuid references public.profiles(id) on delete set null,
	created_at timestamptz not null default now()
);
alter table public.notices enable row level security;
create policy "notices_select_published" on public.notices for select
to anon, authenticated using (published_at is not null);
create policy "notices_admin_all" on public.notices for all
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create table if not exists public.resources (
	id uuid primary key default gen_random_uuid(),
	title text not null,
	description text,
	file_name text not null,
	storage_path text not null,
	file_size bigint not null,
	download_count integer not null default 0,
	published_at timestamptz,
	created_by uuid references public.profiles(id) on delete set null,
	created_at timestamptz not null default now()
);
alter table public.resources enable row level security;
create policy "resources_select_published" on public.resources for select
to anon, authenticated using (published_at is not null);
create policy "resources_admin_all" on public.resources for all
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

insert into storage.buckets (id, name, public)
values ('support-resources', 'support-resources', false)
on conflict (id) do nothing;

create table if not exists public.support_inquiries (
	id uuid primary key default gen_random_uuid(),
	profile_id uuid not null references public.profiles(id) on delete cascade,
	category text not null,
	title text not null,
	content text not null,
	status text not null default 'OPEN' check (status in ('OPEN', 'ANSWERED', 'CLOSED')),
	answered_at timestamptz,
	created_at timestamptz not null default now()
);
alter table public.support_inquiries enable row level security;
create policy "inquiries_select_own_or_admin" on public.support_inquiries for select
to authenticated
using (profile_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "inquiries_insert_own" on public.support_inquiries for insert
to authenticated with check (profile_id = auth.uid());

create table if not exists public.support_inquiry_replies (
	id uuid primary key default gen_random_uuid(),
	inquiry_id uuid not null references public.support_inquiries(id) on delete cascade,
	content text not null,
	is_staff boolean not null default false,
	created_by uuid not null references public.profiles(id) on delete cascade,
	created_at timestamptz not null default now()
);
alter table public.support_inquiry_replies enable row level security;
create policy "replies_select_participants" on public.support_inquiry_replies for select
to authenticated
using (exists (select 1 from public.support_inquiries i where i.id = inquiry_id
	and (i.profile_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))));
create policy "replies_insert_participants" on public.support_inquiry_replies for insert
to authenticated
with check (created_by = auth.uid() and exists (select 1 from public.support_inquiries i where i.id = inquiry_id
	and (i.profile_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))));

grant select, insert, update, delete on public.notices, public.resources, public.support_inquiries, public.support_inquiry_replies to authenticated;
grant select on public.notices, public.resources to anon;
grant all on public.notices, public.resources, public.support_inquiries, public.support_inquiry_replies to service_role;
