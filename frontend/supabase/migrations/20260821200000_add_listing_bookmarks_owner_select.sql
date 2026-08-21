-- 공고 소유자(바이어)가 자기 공고에 달린 관심 표시를 조회할 수 있게 select 정책을 추가한다.
-- 기존 "listing_bookmarks_select_own"(본인이 북마크한 행) 정책과는 permissive라 or로 공존한다.
create policy "listing_bookmarks_select_listing_owner"
on public.listing_bookmarks for select
to authenticated
using (
	exists (
		select 1 from public.listings l
		where l.id = listing_id and l.user_id = auth.uid()
	)
);
