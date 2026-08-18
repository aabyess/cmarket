alter table public.profiles
	add column if not exists plan text not null default 'free'
	check (plan = any (array['free'::text, 'pro'::text, 'max'::text]));
