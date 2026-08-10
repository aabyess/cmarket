create table if not exists public.exchange_rates (
	id uuid primary key default gen_random_uuid(),
	base_currency text not null default 'USD',
	target_currency text not null,
	rate numeric not null,
	updated_at timestamptz not null default now(),
	unique (base_currency, target_currency)
);

alter table public.exchange_rates enable row level security;

-- 전체 조회 가능 (비교표에서 클라이언트/서버 모두 필요), 쓰기는 service_role만
create policy "exchange_rates_select_all"
	on public.exchange_rates
	for select
	using (true);