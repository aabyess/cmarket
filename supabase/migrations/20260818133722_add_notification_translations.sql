alter table public.notifications
	add column if not exists title_source_lang text,
	add column if not exists title_translations jsonb,
	add column if not exists content_source_lang text,
	add column if not exists content_translations jsonb;
