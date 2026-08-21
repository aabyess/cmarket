-- 채팅 도구 서랍 확장: 파일 첨부(file)와 구조화 정보 카드(info, 입금 계좌/납품지 주소)를
-- message_type에 추가한다. 기존에 허용되던 값은 그대로 유지한다.
alter table public.messages
	drop constraint if exists messages_message_type_check;

alter table public.messages
	add constraint messages_message_type_check
	check (message_type = any (array['text'::text, 'quote_pdf'::text, 'invoice_pdf'::text, 'image'::text, 'file'::text, 'info'::text]));

insert into storage.buckets (id, name, public)
values ('chat-files', 'chat-files', false)
on conflict (id) do nothing;

-- chat-images 버킷과 동일한 당사자 검증 패턴: 경로 첫 세그먼트가 quote_id.
create policy "chat_files_select_participants"
on storage.objects for select
to authenticated
using (
	bucket_id = 'chat-files'
	and exists (
		select 1 from quotes q
		join listings l on l.id = q.listing_id
		where q.id::text = (storage.foldername(name))[1]
			and (q.seller_id = auth.uid() or l.user_id = auth.uid())
	)
);

create policy "chat_files_insert_service_role"
on storage.objects for insert
to service_role
with check (bucket_id = 'chat-files');
