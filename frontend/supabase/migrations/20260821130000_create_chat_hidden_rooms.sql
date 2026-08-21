create table if not exists public.chat_hidden_rooms (
	id uuid primary key default gen_random_uuid(),
	profile_id uuid not null references public.profiles(id) on delete cascade,
	quote_id uuid not null references public.quotes(id) on delete cascade,
	hidden_at timestamptz not null default now(),
	unique (profile_id, quote_id)
);

alter table public.chat_hidden_rooms enable row level security;

create policy "chat_hidden_rooms_select_own"
on public.chat_hidden_rooms for select
to authenticated
using (profile_id = auth.uid());

create policy "chat_hidden_rooms_insert_own"
on public.chat_hidden_rooms for insert
to authenticated
with check (profile_id = auth.uid());

create policy "chat_hidden_rooms_update_own"
on public.chat_hidden_rooms for update
to authenticated
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create policy "chat_hidden_rooms_delete_own"
on public.chat_hidden_rooms for delete
to authenticated
using (profile_id = auth.uid());

-- #81 default privileges로 새 테이블은 자동 부여되지만, bank_accounts/notifications에서
-- 실제로 누락된 사례를 겪은 뒤라 명시적으로도 부여해 확실히 한다.
grant select, insert, update, delete on public.chat_hidden_rooms to authenticated;
grant all on public.chat_hidden_rooms to service_role;
