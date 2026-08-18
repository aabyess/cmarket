alter table public.companies
	add column if not exists business_type_source_lang text,
	add column if not exists business_type_translations jsonb,
	add column if not exists business_item_source_lang text,
	add column if not exists business_item_translations jsonb;
