alter table public.listings
	add column if not exists title_source_lang text,
	add column if not exists title_translations jsonb;

alter table public.quotes
	add column if not exists note_source_lang text,
	add column if not exists note_translations jsonb;
