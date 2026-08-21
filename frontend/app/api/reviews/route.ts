import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient, createServerSupabaseClient } from "@/libs/supabaseServer";
import { translateFieldServer } from "@/libs/translateFieldServer";
import { parseJsonBody } from "@/utils/parseJsonBody";

const COMMENT_MAX_LENGTH = 500;

type ReviewMutationBody = {
	contractId?: string;
	rating?: unknown;
	comment?: string;
};

export async function GET(req: NextRequest): Promise<NextResponse> {
	const contractIdsParam = req.nextUrl.searchParams.get("contractIds");
	if (!contractIdsParam) {
		return NextResponse.json([]);
	}
	const contractIds = contractIdsParam.split(",").filter(Boolean);
	if (contractIds.length === 0) {
		return NextResponse.json([]);
	}

	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const { data, error } = await supabase
		.from("reviews")
		.select("contract_id, rating, comment")
		.eq("reviewer_id", user.id)
		.in("contract_id", contractIds);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json(
		(data ?? []).map((row) => ({
			contractId: row.contract_id,
			rating: row.rating,
			comment: row.comment ?? "",
		})),
	);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
	const body = await parseJsonBody<ReviewMutationBody>(req);
	if (!body) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}
	const { contractId, rating, comment } = body;

	if (!contractId) {
		return NextResponse.json({ error: "contractId가 필요합니다." }, { status: 400 });
	}

	if (!Number.isInteger(rating) || (rating as number) < 1 || (rating as number) > 5) {
		return NextResponse.json({ error: "평점은 1~5 사이의 정수여야 합니다." }, { status: 400 });
	}

	if (comment !== undefined && comment.length > COMMENT_MAX_LENGTH) {
		return NextResponse.json({ error: "코멘트는 500자를 넘을 수 없습니다." }, { status: 400 });
	}

	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const admin = await createServerAdminClient();

	const { data: contract } = await admin
		.from("contracts")
		.select("buyer_id, seller_id, payment_confirmed_at")
		.eq("id", contractId)
		.single();

	if (!contract) {
		return NextResponse.json({ error: "계약을 찾을 수 없습니다." }, { status: 404 });
	}

	if (contract.buyer_id !== user.id && contract.seller_id !== user.id) {
		return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
	}

	if (!contract.payment_confirmed_at) {
		return NextResponse.json({ error: "완료된 거래만 평가할 수 있습니다." }, { status: 400 });
	}

	const revieweeId = user.id === contract.buyer_id ? contract.seller_id : contract.buyer_id;

	const trimmedComment = comment?.trim() ?? "";
	const commentTranslation = trimmedComment ? await translateFieldServer(trimmedComment) : null;

	const { error: insertError } = await admin.from("reviews").insert({
		contract_id: contractId,
		reviewer_id: user.id,
		reviewee_id: revieweeId,
		rating,
		comment: trimmedComment || null,
		comment_source_lang: commentTranslation?.sourceLang ?? null,
		comment_translations: commentTranslation?.translations ?? null,
	});

	if (insertError) {
		if (insertError.code === "23505") {
			return NextResponse.json({ error: "이미 평가한 거래입니다." }, { status: 400 });
		}
		return NextResponse.json({ error: insertError.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
