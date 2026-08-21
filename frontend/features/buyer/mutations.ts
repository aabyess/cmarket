import { createClient } from "@/libs/supabase";
import { translateField } from "@/utils/translateField";
import { ListingFormData, ListingDraftResult } from "@/features/buyer/types";

// 공고 등록은 관심 카테고리 셀러 알림(서비스롤로 다른 사용자 프로필을 조회해야 함)까지
// 함께 처리해야 해서 서버 라우트로 옮겼다 — 알림 로직이 클라이언트로 새어나가지 않는다.
export async function postListing(data: ListingFormData): Promise<void> {
	const res = await fetch("/api/listing", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});

	if (!res.ok) {
		const { error } = await res.json();
		throw new Error(error ?? "공고 등록에 실패했습니다.");
	}
}

export async function updateListing(id: string, data: ListingFormData): Promise<void> {
	const supabase = createClient();

	const { data: { user }, error: userError } = await supabase.auth.getUser();
	if (userError || !user) throw new Error("로그인이 필요합니다.");

	const titleTranslation = await translateField(data.title);

	const { error } = await supabase
		.from("listings")
		.update({
			title: data.title,
			title_source_lang: titleTranslation?.sourceLang ?? null,
			title_translations: titleTranslation?.translations ?? null,
			category: data.category,
			description: data.description,
			items: data.items,
			currency: data.currency,
			budget_public: data.budgetPublic,
			total_budget: data.totalBudget,
			delivery_days: data.deliveryDays,
			delivery_method: data.deliveryMethod,
			delivery_provinsi: data.deliveryProvinsi,
			delivery_city: data.deliveryCity,
			delivery_address: data.deliveryAddress,
			delivery_address_detail: data.deliveryAddressDetail,
			delivery_lat: data.deliveryLat,
			delivery_lng: data.deliveryLng,
			delivery_timing_mode: data.deliveryTimingMode,
			delivery_deadline_date: data.deliveryDeadlineDate,
			attachments: data.attachments,
			contact_name: data.contactName,
			contact_phone: data.contactPhone,
		})
		.eq("id", id)
		.eq("user_id", user.id);

	if (error) throw error;
}

export class ListingDraftError extends Error {
	status: number;

	constructor(status: number, message: string) {
		super(message);
		this.name = "ListingDraftError";
		this.status = status;
	}
}

export async function draftListingWithAi(
	prompt: string,
	categoryHint?: string | null,
	file?: File | null,
): Promise<ListingDraftResult> {
	let res: Response;

	if (file) {
		// FormData를 쓸 땐 Content-Type을 직접 지정하면 안 된다 — 브라우저가
		// boundary를 포함해 알아서 붙여준다.
		const formData = new FormData();
		formData.append("prompt", prompt);
		if (categoryHint) formData.append("categoryHint", categoryHint);
		formData.append("file", file);
		res = await fetch("/api/ai/draft-listing", { method: "POST", body: formData });
	} else {
		res = await fetch("/api/ai/draft-listing", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ prompt, categoryHint: categoryHint ?? undefined }),
		});
	}

	if (!res.ok) {
		const { error } = await res.json();
		throw new ListingDraftError(res.status, error ?? "AI 초안 생성에 실패했습니다.");
	}

	return res.json();
}

export async function deleteListing(id: string): Promise<void> {
	const supabase = createClient();

	const { data: { user }, error: userError } = await supabase.auth.getUser();
	if (userError || !user) throw new Error("로그인이 필요합니다.");

	const { error } = await supabase
		.from("listings")
		.delete()
		.eq("id", id)
		.eq("user_id", user.id);

	if (error) throw error;
}

export async function extendListingDeadline(id: string, extendDays: number): Promise<void> {
	const supabase = createClient();

	const { data: { user }, error: userError } = await supabase.auth.getUser();
	if (userError || !user) throw new Error("로그인이 필요합니다.");

	// "오늘 + N일"이 아니라 "기존 마감일 + N일"이어야 연장이다.
	// 기존 마감일이 이미 지났으면 오늘을 기준으로 연장한다.
	const { data: current, error: fetchError } = await supabase
		.from("listings")
		.select("end_date")
		.eq("id", id)
		.eq("user_id", user.id)
		.single();

	if (fetchError || !current) throw new Error("공고를 찾을 수 없습니다.");

	const base = new Date(Math.max(new Date(current.end_date).getTime(), Date.now()));
	const newDeadline = new Date(base);
	newDeadline.setDate(newDeadline.getDate() + extendDays);

	const { error } = await supabase
		.from("listings")
		.update({
			end_date: newDeadline.toISOString(),
			status: "active",
		})
		.eq("id", id)
		.eq("user_id", user.id);

	if (error) throw error;
}