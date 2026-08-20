-- 채팅방 목록이 모든 방의 전체 메시지 이력을 내려받지 않도록
-- 방별 최신 메시지 미리보기와 안읽음 수를 DB에서 집계한다.
-- security invoker라 messages RLS가 그대로 적용된다.
create or replace function public.get_chat_room_summaries(p_quote_ids uuid[], p_user_id uuid)
returns table (
	quote_id uuid,
	last_content text,
	last_message_type text,
	last_created_at timestamptz,
	unread_count bigint
)
language sql
stable
security invoker
as $$
	select
		m.quote_id,
		(array_agg(m.content order by m.created_at desc))[1] as last_content,
		(array_agg(m.message_type order by m.created_at desc))[1] as last_message_type,
		max(m.created_at) as last_created_at,
		count(*) filter (where m.is_read = false and m.sender_id <> p_user_id) as unread_count
	from public.messages m
	where m.quote_id = any(p_quote_ids)
	group by m.quote_id
$$;

create index if not exists messages_quote_id_created_at_idx
	on public.messages (quote_id, created_at desc);
