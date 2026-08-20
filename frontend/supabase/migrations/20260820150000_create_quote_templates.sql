-- 셀러가 자주 쓰는 견적 양식(메모/결제조건/납기일수/통화)을 이름을 붙여 저장해두고
-- 견적 작성 시 불러올 수 있게 한다.
create table if not exists public.quote_templates (
	id uuid primary key default gen_random_uuid(),
	profile_id uuid not null references public.profiles(id) on delete cascade,
	name text not null,
	note text,
	payment_terms text,
	delivery_days integer,
	currency text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

alter table public.quote_templates enable row level security;

create policy "own_quote_templates" on public.quote_templates
	for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
