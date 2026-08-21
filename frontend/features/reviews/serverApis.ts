import { getLocale } from "next-intl/server";
import { createServerAdminClient } from "@/libs/supabaseServer";
import { resolveTranslatedField } from "@/utils/resolveTranslatedField";

export type CompanyReview = {
	id: string;
	rating: number;
	comment: string;
	reviewerCompanyName: string;
	createdAt: string;
};

export type CompanyReviewsSummary = {
	reviews: CompanyReview[];
	totalCount: number;
	averageRating: number | null;
};

const EMPTY_SUMMARY: CompanyReviewsSummary = { reviews: [], totalCount: 0, averageRating: null };

/** 기업 공개 페이지용. 비로그인 방문자도 볼 수 있어야 하므로 서비스롤로 조회한다. */
export async function getCompanyReviews(profileId: string, limit: number): Promise<CompanyReviewsSummary> {
	const admin = await createServerAdminClient();
	const locale = await getLocale();

	const [{ data, error, count }, { data: allRatings }] = await Promise.all([
		admin
			.from("reviews")
			.select("id, rating, comment, comment_source_lang, comment_translations, reviewer_id, created_at", {
				count: "exact",
			})
			.eq("reviewee_id", profileId)
			.order("created_at", { ascending: false })
			.limit(limit),
		admin.from("reviews").select("rating").eq("reviewee_id", profileId),
	]);

	if (error || !data || data.length === 0) return EMPTY_SUMMARY;

	const reviewerIds = [...new Set(data.map((row) => row.reviewer_id))];
	const { data: companies } = await admin
		.from("companies")
		.select("profile_id, company_name")
		.in("profile_id", reviewerIds);
	const companyMap = new Map((companies ?? []).map((c) => [c.profile_id, c.company_name]));

	const averageRating =
		allRatings && allRatings.length > 0
			? Math.round((allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length) * 10) / 10
			: null;

	return {
		reviews: data.map((row) => ({
			id: row.id,
			rating: row.rating,
			comment: resolveTranslatedField(row.comment ?? "", row.comment_source_lang, row.comment_translations, locale),
			reviewerCompanyName: companyMap.get(row.reviewer_id) ?? "",
			createdAt: row.created_at,
		})),
		totalCount: count ?? data.length,
		averageRating,
	};
}
