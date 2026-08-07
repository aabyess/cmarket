create or replace function award_quote(p_quote_id uuid, p_buyer_id uuid)
returns uuid
language plpgsql
as $$
declare
	v_listing_id uuid;
	v_seller_id uuid;
	v_quote_status text;
	v_listing_buyer_id uuid;
	v_listing_status text;
	v_contract_id uuid;
begin
	select listing_id, seller_id, status
	into v_listing_id, v_seller_id, v_quote_status
	from quotes
	where id = p_quote_id
	for update;

	if not found then
		raise exception 'QUOTE_NOT_FOUND';
	end if;

	select user_id, status into v_listing_buyer_id, v_listing_status
	from listings
	where id = v_listing_id
	for update;

	if not found then
		raise exception 'LISTING_NOT_FOUND';
	end if;

	if v_listing_buyer_id != p_buyer_id then
		raise exception 'FORBIDDEN';
	end if;

	if v_listing_status = 'closed' then
		raise exception 'LISTING_ALREADY_AWARDED';
	end if;

	if v_quote_status = 'awarded' then
		raise exception 'ALREADY_AWARDED';
	end if;

	update quotes set status = 'awarded' where id = p_quote_id;

	update quotes
	set status = 'rejected'
	where listing_id = v_listing_id
		and id != p_quote_id
		and status = 'pending';

	update listings set status = 'closed' where id = v_listing_id;

	insert into contracts (listing_id, quote_id, buyer_id, seller_id, status)
	values (v_listing_id, p_quote_id, p_buyer_id, v_seller_id, 'ongoing')
	returning id into v_contract_id;

	return v_contract_id;
end;
$$;