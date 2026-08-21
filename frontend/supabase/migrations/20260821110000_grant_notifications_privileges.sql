-- public.notifications는 #81(grant_default_privileges 마이그레이션)보다 먼저 만들어진 테이블이라
-- alter default privileges 자동 부여 대상이 아니었다. service_role로 이 테이블에 insert를
-- 시도하면 permission denied(42501)로 조용히 실패해왔다 — 기존 견적/계약/인증 알림도
-- 영향을 받았을 것으로 보인다(로그만 남고 등록 자체는 막지 않는 방식이라 눈에 안 띔).
grant select, insert, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
