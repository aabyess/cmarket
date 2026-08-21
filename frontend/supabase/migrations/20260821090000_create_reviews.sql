-- 거래(계약) 완료 후 바이어/셀러가 서로를 평가하는 리뷰. 검증이 필요한 쓰기는
-- 서비스롤 API 라우트에서만 하므로 insert 정책은 없다 — select는 평점 공개라 전체 허용.
create table if not exists public.reviews (
	id uuid primary key default gen_random_uuid(),
	contract_id uuid not null references public.contracts(id) on delete cascade,
	reviewer_id uuid not null references public.profiles(id) on delete cascade,
	reviewee_id uuid not null references public.profiles(id) on delete cascade,
	rating integer not null check (rating between 1 and 5),
	comment text,
	comment_source_lang text,
	comment_translations jsonb,
	created_at timestamptz not null default now(),
	unique (contract_id, reviewer_id)
);

alter table public.reviews enable row level security;

create policy "reviews_select" on public.reviews for select using (true);
