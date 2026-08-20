-- 바이어/셀러가 거의 동시에 인보이스 카드를 열면 각자 insert가 성공해
-- 서로 다른 인보이스 번호의 메시지가 2개 생길 수 있었다.
-- quote_pdf는 로케일별로 여러 장이 정상이므로 invoice_pdf에만 부분 유니크 인덱스를 건다.
create unique index if not exists messages_invoice_pdf_unique
	on public.messages (quote_id)
	where message_type = 'invoice_pdf';
