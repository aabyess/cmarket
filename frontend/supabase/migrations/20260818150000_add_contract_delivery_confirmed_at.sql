alter table public.contracts
	add column if not exists delivery_confirmed_at timestamptz;
