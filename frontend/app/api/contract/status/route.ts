import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";
import { translateFieldServer } from "@/libs/translateFieldServer";
import { routing } from "@/i18n/routing";

const CANCEL_ERROR_MESSAGES: Record<string, string> = {
	CONTRACT_NOT_FOUND: "계약을 찾을 수 없습니다.",
	FORBIDDEN: "권한이 없습니다.",
	NOT_ONGOING: "진행 중인 계약만 취소할 수 있습니다.",
	RECEIPT_EXISTS: "송금 영수증이 등록된 계약은 취소할 수 없습니다. 채팅으로 협의해주세요.",
};

export async function PATCH(req: NextRequest): Promise<NextResponse> {
	const { contractId, status } = await req.json();
	if (!contractId || !status) {
		return NextResponse.json({ error: "필수 값이 없습니다." }, { status: 400 });
	}

	const authClient = await createServerSupabaseClient();
	const {
		data: { user },
	} = await authClient.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const admin = await createServerAdminClient();

	// 계약 조회 — 권한 및 역할 확인
	const { data: contract } = await admin
		.from("contracts")
		.select("buyer_id, seller_id, status, listing_id")
		.eq("id", contractId)
		.single();

	if (!contract) {
		return NextResponse.json({ error: "계약을 찾을 수 없습니다." }, { status: 404 });
	}

	const isBuyer = contract.buyer_id === user.id;
	const isSeller = contract.seller_id === user.id;

	if (!isBuyer && !isSeller) {
		return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
	}

	if (status === "cancelled") {
		// 취소는 공고/견적 복구까지 원자적으로 처리해야 하므로 DB 함수에 맡긴다
		const { data: quoteId, error } = await admin.rpc("cancel_contract", {
			p_contract_id: contractId,
			p_user_id: user.id,
		});

		if (error) {
			if (!CANCEL_ERROR_MESSAGES[error.message]) {
				console.error("cancel_contract rpc error:", error);
			}
			const message =
				CANCEL_ERROR_MESSAGES[error.message] ?? "계약 취소 처리 중 오류가 발생했습니다.";
			const httpStatus =
				error.message === "FORBIDDEN" ? 403 : error.message === "CONTRACT_NOT_FOUND" ? 404 : 400;
			return NextResponse.json({ error: message }, { status: httpStatus });
		}

		// 캐시된 인보이스 PDF 제거 — 재확정 시 옛 인보이스 번호가 재사용되지 않도록.
		// 실패해도 취소를 되돌리지는 않는다.
		await admin.storage
			.from("quote-documents")
			.remove(routing.locales.map((locale) => `invoices/${quoteId}/invoice-${locale}.pdf`));

		await notifyPartnerOfCancellation(admin, {
			partnerId: isBuyer ? contract.seller_id : contract.buyer_id,
			cancellerId: user.id,
			listingId: contract.listing_id,
			quoteId: quoteId as string,
		});

		return NextResponse.json({ success: true });
	}

	// 입금 확인(completed)은 Seller만 가능
	if (status === "completed" && !isSeller) {
		return NextResponse.json({ error: "입금 확인은 공급기업만 가능합니다." }, { status: 403 });
	}

	const updateData: Record<string, string> = { status };
	if (status === "completed") {
		updateData.payment_confirmed_at = new Date().toISOString();
	}

	const { error } = await admin.from("contracts").update(updateData).eq("id", contractId);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}

type AdminClient = Awaited<ReturnType<typeof createServerAdminClient>>;

type CancellationNotice = {
	partnerId: string;
	cancellerId: string;
	listingId: string;
	quoteId: string;
};

// 상대방에게 취소를 알린다. 남의 행에 쓰는 것이라 RLS 를 통과하지 못하므로 서버에서 만든다.
// 알림 실패가 취소 자체를 되돌리지는 않는다.
async function notifyPartnerOfCancellation(
	admin: AdminClient,
	{ partnerId, cancellerId, listingId, quoteId }: CancellationNotice,
): Promise<void> {
	const [{ data: company }, { data: listing }] = await Promise.all([
		admin.from("companies").select("company_name").eq("profile_id", cancellerId).single(),
		admin.from("listings").select("title").eq("id", listingId).single(),
	]);

	const notificationTitle = "계약이 취소되었어요";
	const notificationContent = `${company?.company_name ?? "거래처"} · ${listing?.title ?? ""}`;

	const [titleTranslation, contentTranslation] = await Promise.all([
		translateFieldServer(notificationTitle),
		translateFieldServer(notificationContent),
	]);

	const { error } = await admin.from("notifications").insert({
		profile_id: partnerId,
		type: "message",
		quote_id: quoteId,
		title: notificationTitle,
		content: notificationContent,
		title_source_lang: titleTranslation?.sourceLang ?? null,
		title_translations: titleTranslation?.translations ?? null,
		content_source_lang: contentTranslation?.sourceLang ?? null,
		content_translations: contentTranslation?.translations ?? null,
	});

	if (error) {
		console.error("cancel notificationError:", error);
	}
}
