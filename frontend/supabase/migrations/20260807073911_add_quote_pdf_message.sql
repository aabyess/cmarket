alter table messages
	add column message_type text not null default 'text',
	add column attachment_url text,
	add column attachment_name text;

alter table messages
	add constraint messages_message_type_check
	check (message_type = any (array['text'::text, 'quote_pdf'::text]));

insert into storage.buckets (id, name, public)
values ('quote-documents', 'quote-documents', false)
on conflict (id) do nothing;

create policy "quote_documents_select_participants"
on storage.objects for select
to authenticated
using (
	bucket_id = 'quote-documents'
	and exists (
		select 1 from quotes q
		join listings l on l.id = q.listing_id
		where q.id::text = (storage.foldername(name))[1]
			and (q.seller_id = auth.uid() or l.user_id = auth.uid())
	)
);

create policy "quote_documents_insert_service_role"
on storage.objects for insert
to service_role
with check (bucket_id = 'quote-documents');