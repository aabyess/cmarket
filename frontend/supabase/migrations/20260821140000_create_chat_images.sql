-- messages_message_type_check가 마이그레이션 이력상으로는 text/quote_pdf만 허용하지만,
-- 실데이터 삽입 테스트로 확인한 결과 invoice_pdf는 이미 허용되고 있었다(이력에 없는 수동 변경 추정).
-- image만 새로 추가하고 기존에 통과가 확인된 값은 그대로 유지한다.
alter table public.messages
	drop constraint if exists messages_message_type_check;

alter table public.messages
	add constraint messages_message_type_check
	check (message_type = any (array['text'::text, 'quote_pdf'::text, 'invoice_pdf'::text, 'image'::text]));

insert into storage.buckets (id, name, public)
values ('chat-images', 'chat-images', false)
on conflict (id) do nothing;

-- quote-documents 버킷과 동일한 당사자 검증 패턴: 경로 첫 세그먼트가 quote_id.
create policy "chat_images_select_participants"
on storage.objects for select
to authenticated
using (
	bucket_id = 'chat-images'
	and exists (
		select 1 from quotes q
		join listings l on l.id = q.listing_id
		where q.id::text = (storage.foldername(name))[1]
			and (q.seller_id = auth.uid() or l.user_id = auth.uid())
	)
);

create policy "chat_images_insert_service_role"
on storage.objects for insert
to service_role
with check (bucket_id = 'chat-images');
