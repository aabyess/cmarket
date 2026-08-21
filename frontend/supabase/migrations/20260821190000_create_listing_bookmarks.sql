create table if not exists public.listing_bookmarks (
	id uuid primary key default gen_random_uuid(),
	profile_id uuid not null references public.profiles(id) on delete cascade,
	listing_id uuid not null references public.listings(id) on delete cascade,
	created_at timestamptz not null default now(),
	unique (profile_id, listing_id)
);

alter table public.listing_bookmarks enable row level security;

create policy "listing_bookmarks_select_own"
on public.listing_bookmarks for select
to authenticated
using (profile_id = auth.uid());

create policy "listing_bookmarks_insert_own"
on public.listing_bookmarks for insert
to authenticated
with check (profile_id = auth.uid());

create policy "listing_bookmarks_delete_own"
on public.listing_bookmarks for delete
to authenticated
using (profile_id = auth.uid());

-- #81 default privileges로 새 테이블은 자동 부여되지만, 과거 여러 테이블에서 실제로
-- 누락된 사례를 겪은 뒤라 명시적으로도 부여해 확실히 한다.
grant select, insert, delete on public.listing_bookmarks to authenticated;
grant all on public.listing_bookmarks to service_role;

-- notifications.type 제약이 마이그레이션 이력에는 없지만(과거 수동 생성 추정),
-- messages_message_type_check와 동일하게 방어적으로 기존에 실사용 중인 값을 모두
-- 유지한 채로 "bookmark"를 추가한다. 실사용 값은 코드베이스 전수 조사로 확인:
-- message, quote, award, verification, newListing.
alter table public.notifications
	drop constraint if exists notifications_type_check;

alter table public.notifications
	add constraint notifications_type_check
	check (
		type = any (
			array[
				'message'::text,
				'quote'::text,
				'award'::text,
				'verification'::text,
				'newListing'::text,
				'bookmark'::text
			]
		)
	);
