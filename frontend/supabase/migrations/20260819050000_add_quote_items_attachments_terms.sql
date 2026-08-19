alter table public.quotes
	add column if not exists items jsonb,
	add column if not exists attachments jsonb,
	add column if not exists validity_days integer,
	add column if not exists payment_terms text;

-- 견적 첨부(카탈로그·스펙시트 등) 저장용 비공개 버킷.
-- 업로드/서명 URL 발급 모두 서버 라우트(app/api/seller/upload-quote-attachment,
-- app/api/seller/quote-attachment-url)가 서비스 롤로 직접 처리하며 그 안에서
-- 권한을 검증하므로, 별도의 storage RLS 정책은 두지 않는다.
insert into storage.buckets (id, name, public)
values ('quote-attachments', 'quote-attachments', false)
on conflict (id) do nothing;
