alter table public.companies
	add column if not exists verification_status text not null default 'unverified'
		check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
	add column if not exists verification_method text,
	add column if not exists verified_at timestamptz,
	add column if not exists verification_document_url text,
	add column if not exists verification_note text,
	add column if not exists verification_requested_at timestamptz;

insert into storage.buckets (id, name, public)
values ('verification-documents', 'verification-documents', false)
on conflict (id) do nothing;

-- 실제 업로드/서명URL 발급은 전부 서버(서비스롤)를 거치지만, quote-documents와
-- 동일하게 본인 소유 파일 조회는 authenticated select도 열어둔다.
create policy "verification_documents_select_owner_or_admin"
on storage.objects for select
to authenticated
using (
	bucket_id = 'verification-documents'
	and (
		(storage.foldername(name))[1] = auth.uid()::text
		or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
	)
);

create policy "verification_documents_insert_service_role"
on storage.objects for insert
to service_role
with check (bucket_id = 'verification-documents');
