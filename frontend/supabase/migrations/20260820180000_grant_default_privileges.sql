-- 이 Supabase 프로젝트는 새 테이블을 만들어도 authenticated/service_role에 권한이
-- 자동으로 부여되지 않는다. listing_templates 테이블 생성 후 "권한 없음(42501)"으로
-- 저장이 실패해 SQL Editor에서 수동 grant로 해결했는데, 새 환경 배포나 새 테이블
-- 추가 때마다 반복될 문제라 재발 방지를 위해 아래를 적용한다.

-- 1) 기존 테이블 보정 (이미 수동 적용된 환경에서 다시 실행해도 무해)
grant select, insert, update, delete on public.listing_templates to authenticated;
grant all on public.listing_templates to service_role;

-- 2) 앞으로 이 스키마에 새로 만들어지는 테이블에 자동으로 권한을 부여한다.
-- SQL Editor는 postgres 롤로 실행되므로, alter default privileges도 postgres 롤
-- 기준으로 적용된다 — 우리 마이그레이션 절차(SQL Editor 수동 실행)와 그대로 맞는다.
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant all on tables to service_role;
