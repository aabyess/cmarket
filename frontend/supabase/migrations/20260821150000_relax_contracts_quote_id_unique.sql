-- 계약 취소(cancel_contract) 후 견적이 pending으로 복구돼 같은 견적을 다시
-- 계약 확정할 수 있어야 하는데, contracts.quote_id의 전체 유니크 제약 때문에
-- award_quote의 insert가 "duplicate key value violates unique constraint
-- contracts_quote_id_key"로 실패해왔다. 취소 이력(cancelled 행)은 보존해야
-- 하므로, 취소되지 않은 계약만 견적당 1개로 제한하는 부분 유니크 인덱스로
-- 완화한다.
--
-- 실제 환경에서 제약이 CONSTRAINT로 만들어졌는지 bare INDEX로 만들어졌는지
-- 서비스롤로는 확인할 수 없어(pg_constraint 조회 불가) 양쪽 다 안전하게 지운다.
alter table public.contracts drop constraint if exists contracts_quote_id_key;
drop index if exists public.contracts_quote_id_key;

create unique index if not exists contracts_quote_id_active_key
	on public.contracts (quote_id)
	where status <> 'cancelled';
