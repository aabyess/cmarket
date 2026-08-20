import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";
import { createInvoiceMeta } from "@/features/chat/pdf/getInvoicePdfData";
import { translateFieldServer } from "@/libs/translateFieldServer";
import { parseJsonBody } from "@/utils/parseJsonBody";

const ERROR_MESSAGES: Record<string, string> = {
	QUOTE_NOT_FOUND: "견적을 찾을 수 없습니다.",
	LISTING_NOT_FOUND: "공고를 찾을 수 없습니다.",
	FORBIDDEN: "권한이 없습니다.",
	LISTING_ALREADY_AWARDED: "이미 마감된 공고입니다.",
	ALREADY_AWARDED: "이미 확정된 견적입니다.",
};

export async function POST(req: NextRequest): Promise<NextResponse> {
	const body = await parseJsonBody<{ quoteId?: string }>(req);
	if (!body) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}
	const { quoteId } = body;
	if (!quoteId) {
		return NextResponse.json({ error: "quoteId가 필요합니다." }, { status: 400 });
	}

	const authClient = await createServerSupabaseClient();
	const {
		data: { user },
	} = await authClient.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const admin = await createServerAdminClient();

	const { data: quote } = await admin
		.from("quotes")
		.select("seller_id, listing_id")
		.eq("id", quoteId)
		.single();

	const { data: contractId, error } = await admin.rpc("award_quote", {
		p_quote_id: quoteId,
		p_buyer_id: user.id,
	});

	if (error) {
		const message = ERROR_MESSAGES[error.message] ?? "계약 확정 처리 중 오류가 발생했습니다.";
		const status =
			error.message === "FORBIDDEN" ? 403 : error.message === "QUOTE_NOT_FOUND" ? 404 : 400;
		return NextResponse.json({ error: message }, { status });
	}

	// 바이어 본인의 대시보드 최근 활동에도 계약 확정 기록이 남도록 알린다.
	// 알림 실패가 낙찰 확정 자체를 되돌리지는 않는다.
	if (quote?.listing_id) {
		const { data: listing } = await admin
			.from("listings")
			.select("title")
			.eq("id", quote.listing_id)
			.single();

		const notificationTitle = "계약이 확정됐어요";
		const notificationContent = listing?.title ?? "";

		const [titleTranslation, contentTranslation] = await Promise.all([
			translateFieldServer(notificationTitle),
			translateFieldServer(notificationContent),
		]);

		const notificationBase = {
			quote_id: quoteId,
			title: notificationTitle,
			content: notificationContent,
			title_source_lang: titleTranslation?.sourceLang ?? null,
			title_translations: titleTranslation?.translations ?? null,
			content_source_lang: contentTranslation?.sourceLang ?? null,
			content_translations: contentTranslation?.translations ?? null,
		};

		// 바이어 본인 + 낙찰된 셀러 양쪽에 알린다.
		// 클릭 시 계약 페이지로 라우팅할 수 있도록 전용 타입 "award"로 저장한다.
		// notifications.type에 check 제약이 있는 환경이면 실패하므로 "message"로 폴백한다.
		const notificationProfileIds = [user.id, quote.seller_id].filter(
			(id): id is string => typeof id === "string",
		);

		for (const profileId of notificationProfileIds) {
			const notificationRow = { ...notificationBase, profile_id: profileId };
			const { error: notificationError } = await admin
				.from("notifications")
				.insert({ ...notificationRow, type: "award" });

			if (notificationError) {
				const { error: fallbackError } = await admin
					.from("notifications")
					.insert({ ...notificationRow, type: "message" });
				if (fallbackError) {
					console.error("award notificationError:", fallbackError);
				}
			}
		}
	}

	// 낙찰 확정 시 채팅에 인보이스 카드 메시지를 만든다. PDF 자체는 카드가 열릴 때 생성된다.
	if (quote?.seller_id) {
		const { data: existingInvoice } = await admin
			.from("messages")
			.select("id")
			.eq("quote_id", quoteId)
			.eq("message_type", "invoice_pdf")
			.limit(1)
			.maybeSingle();

		if (!existingInvoice) {
			// 바이어/셀러가 거의 동시에 카드를 열면 둘 다 insert를 시도할 수 있다.
			// messages_invoice_pdf_unique 인덱스로 막힌 중복(23505)은 정상 상황이라 무시한다.
			const { error: insertError } = await admin.from("messages").insert({
				quote_id: quoteId,
				sender_id: quote.seller_id,
				content: JSON.stringify(createInvoiceMeta(quoteId)),
				message_type: "invoice_pdf",
			});
			if (insertError && insertError.code !== "23505") {
				console.error("invoice message insert error:", insertError);
			}
		}
	}

	let invoiceWarning: string | null = null;
	if (quote?.seller_id) {
		const { data: bankAccount } = await admin
			.from("bank_accounts")
			.select("id")
			.eq("profile_id", quote.seller_id)
			.eq("is_primary", true)
			.maybeSingle();

		if (!bankAccount) {
			invoiceWarning =
				"공급기업이 아직 계좌 정보를 등록하지 않아 인보이스 발행이 지연될 수 있습니다.";
		}
	}

	return NextResponse.json({ contractId, invoiceWarning });
}
