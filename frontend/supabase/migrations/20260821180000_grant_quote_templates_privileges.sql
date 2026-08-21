-- quote_templates는 #81 default privileges 도입(20260820180000) 이전에 생성돼(20260820150000)
-- service_role/authenticated grant가 누락돼 있었다(bank_accounts/notifications와 같은 패턴).
-- 관리자 회원 삭제 라우트가 이 테이블도 명시적으로 지워야 해서 서비스롤 grant가 선행돼야 한다.
grant all on public.quote_templates to service_role;
grant select, insert, update, delete on public.quote_templates to authenticated;
