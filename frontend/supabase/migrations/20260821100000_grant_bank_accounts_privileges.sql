-- bank_accounts는 migrations 도입 이전에 만들어진 테이블이라, 20260820180000의
-- "새 테이블에 자동 권한 부여" 대책이 소급 적용되지 않았다. 온보딩 체크리스트에서
-- 서비스롤로 bank_accounts를 조회하다 42501(permission denied)을 직접 확인했다 —
-- listing_templates와 동일한 문제라 동일한 방식으로 보정한다.
grant select, insert, update, delete on public.bank_accounts to authenticated;
grant all on public.bank_accounts to service_role;
