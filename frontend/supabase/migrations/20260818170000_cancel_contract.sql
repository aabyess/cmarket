-- 계약 취소를 원자적으로 처리한다: 계약을 취소하고, 공고와 견적을
-- 확정 이전 상태로 복구해 발주사가 다른 견적을 다시 고를 수 있게 한다.
-- 송금 영수증이 등록된 계약은 일방 취소할 수 없다.
create or replace function cancel_contract(p_contract_id uuid, p_user_id uuid)
returns uuid
language plpgsql
as $$
declare
	v_listing_id uuid;
	v_quote_id uuid;
	v_buyer_id uuid;
	v_seller_id uuid;
	v_status text;
	v_receipt text;
begin
	select listing_id, quote_id, buyer_id, seller_id, status, payment_receipt_url
	into v_listing_id, v_quote_id, v_buyer_id, v_seller_id, v_status, v_receipt
	from contracts
	where id = p_contract_id
	for update;

	if not found then
		raise exception 'CONTRACT_NOT_FOUND';
	end if;

	if p_user_id != v_buyer_id and p_user_id != v_seller_id then
		raise exception 'FORBIDDEN';
	end if;

	if v_status != 'ongoing' then
		raise exception 'NOT_ONGOING';
	end if;

	if v_receipt is not null then
		raise exception 'RECEIPT_EXISTS';
	end if;

	update contracts set status = 'cancelled' where id = p_contract_id;

	update quotes set status = 'pending' where id = v_quote_id;

	-- 확정 때 미선정 처리된 다른 견적들을 다시 선택 가능하게 되돌린다
	update quotes
	set status = 'pending'
	where listing_id = v_listing_id
		and status = 'rejected';

	update listings set status = 'active' where id = v_listing_id;

	-- 취소된 계약의 인보이스는 무효이므로 채팅 카드를 제거한다.
	-- 재확정 시 새 인보이스가 발행된다.
	delete from messages
	where quote_id = v_quote_id
		and message_type = 'invoice_pdf';

	return v_quote_id;
end;
$$;
