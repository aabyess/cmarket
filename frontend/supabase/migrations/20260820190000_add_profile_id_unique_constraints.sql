-- 코드 전체가 companies/contacts/company_profiles를 profile당 1행으로 전제한다
-- (.eq("profile_id", ...).single(), upsert(onConflict: "profile_id")) 하지만
-- profile_id에 실제 unique 제약이 없었다. 적용 전 중복 데이터 없음을 확인했다.
create unique index if not exists companies_profile_id_key on public.companies (profile_id);
create unique index if not exists contacts_profile_id_key on public.contacts (profile_id);
create unique index if not exists company_profiles_profile_id_key on public.company_profiles (profile_id);
