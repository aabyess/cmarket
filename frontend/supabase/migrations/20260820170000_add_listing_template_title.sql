-- 공고 템플릿 저장 시 제목(견적요청 제목)도 함께 저장·복원할 수 있도록 컬럼을 추가한다.
alter table public.listing_templates add column if not exists title text;
