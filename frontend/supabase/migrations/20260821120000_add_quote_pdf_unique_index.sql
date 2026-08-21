-- 견적서 PDF 메시지 무한 중복 버그(뷰어 렌더링 → 라우트 호출 → maybeSingle이
-- 중복 2건 이상에서 에러 → "없음"으로 오판해 insert → 새 카드 렌더링 → 반복) 정리.
-- 1) 이미 쌓인 중복 제거: (quote_id, attachment_url)별로 가장 오래된 1건만 남긴다.
delete from public.messages m
using public.messages k
where m.message_type = 'quote_pdf'
	and k.message_type = 'quote_pdf'
	and m.quote_id = k.quote_id
	and m.attachment_url = k.attachment_url
	and m.id <> k.id
	and (m.created_at > k.created_at or (m.created_at = k.created_at and m.id > k.id));

-- 2) 재발 방지 백스톱: invoice_pdf 인덱스와 같은 패턴.
--    quote_pdf는 로케일별 여러 장이 정상이라 attachment_url까지 포함해 유니크.
create unique index if not exists messages_quote_pdf_unique
	on public.messages (quote_id, attachment_url)
	where message_type = 'quote_pdf';
