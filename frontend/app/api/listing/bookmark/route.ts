// app/api/listing/bookmark/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient, createServerSupabaseClient } from "@/libs/supabaseServer";
import { translateFieldServer } from "@/libs/translateFieldServer";
import { parseJsonBody } from "@/utils/parseJsonBody";

type BookmarkBody = { listingId?: string; bookmarked?: boolean };

export async function POST(req: NextRequest): Promise<NextResponse> {
	const body = await parseJsonBody<BookmarkBody>(req);
	if (!body || typeof body.listingId !== "string" || typeof body.bookmarked !== "boolean") {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}
	const { listingId, bookmarked } = body;

	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const admin = await createServerAdminClient();

	const { data: listing } = await admin
		.from("listings")
		.select("id, title, user_id")
		.eq("id", listingId)
		.single();

	if (!listing) {
		return NextResponse.json({ error: "공고를 찾을 수 없습니다." }, { status: 404 });
	}
	if (listing.user_id === user.id) {
		return NextResponse.json({ error: "본인 공고는 관심 등록할 수 없습니다." }, { status: 400 });
	}

	if (!bookmarked) {
		const { error } = await supabase
			.from("listing_bookmarks")
			.delete()
			.eq("profile_id", user.id)
			.eq("listing_id", listingId);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
		return NextResponse.json({ success: true });
	}

	// RLS가 profile_id = auth.uid()만 허용하므로 소유권 확인은 DB가 최종 방어선이다.
	const { error: insertError } = await supabase
		.from("listing_bookmarks")
		.upsert(
			{ profile_id: user.id, listing_id: listingId },
			{ onConflict: "profile_id,listing_id", ignoreDuplicates: true },
		);

	if (insertError) {
		return NextResponse.json({ error: insertError.message }, { status: 500 });
	}

	// 발주사에게 알린다. 알림은 남의 행에 쓰는 것이라 서비스 롤로 만든다.
	// 실패해도 북마크 자체는 이미 성공했으니 되돌리지 않고 로깅만 한다.
	try {
		const { data: company } = await admin
			.from("companies")
			.select("company_name")
			.eq("profile_id", user.id)
			.single();

		const notificationTitle = `${company?.company_name ?? "공급기업"}님이 회원님의 공고에 관심을 보였어요`;
		const notificationContent = listing.title;

		// notifications에는 listing_id 컬럼이 없어(과거부터 quote_id만 존재) 같은 (셀러, 공고)
		// 조합을 title(발주기업명 포함)+content(공고 제목) 조합으로 식별한다. 이미 보낸 적 있으면
		// 껐다 켰다를 반복해도 재발송하지 않는다.
		const { data: existingNotification } = await admin
			.from("notifications")
			.select("id")
			.eq("profile_id", listing.user_id)
			.eq("type", "bookmark")
			.eq("title", notificationTitle)
			.eq("content", notificationContent)
			.limit(1)
			.maybeSingle();

		if (!existingNotification) {
			const [titleTranslation, contentTranslation] = await Promise.all([
				translateFieldServer(notificationTitle),
				translateFieldServer(notificationContent),
			]);

			const { error: notificationError } = await admin.from("notifications").insert({
				profile_id: listing.user_id,
				type: "bookmark",
				title: notificationTitle,
				content: notificationContent,
				title_source_lang: titleTranslation?.sourceLang ?? null,
				title_translations: titleTranslation?.translations ?? null,
				content_source_lang: contentTranslation?.sourceLang ?? null,
				content_translations: contentTranslation?.translations ?? null,
			});

			if (notificationError) {
				console.error("bookmark notificationError:", notificationError);
			}
		}
	} catch (err) {
		console.error("bookmark notification failed:", err);
	}

	return NextResponse.json({ success: true });
}
