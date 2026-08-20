-- 바이어가 자주 쓰는 공고 양식(카테고리/설명/품목/통화)을 이름을 붙여 저장해두고
-- 공고 등록 시 불러올 수 있게 한다.
create table if not exists public.listing_templates (
	id uuid primary key default gen_random_uuid(),
	profile_id uuid not null references public.profiles(id) on delete cascade,
	name text not null,
	category text,
	description text,
	items jsonb,
	currency text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

alter table public.listing_templates enable row level security;

create policy "own_listing_templates" on public.listing_templates
	for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
