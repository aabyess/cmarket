import { getLocale, getTranslations } from "next-intl/server";
import { createServerAdminClient, createServerSupabaseClient } from "@/libs/supabaseServer";
import { SITE_PAGE_LOCALE, SITE_PAGE_SLUG } from "@/features/siteBuilder/constants";
import { isBlockArray, normalizeBlocks } from "@/features/siteBuilder/utils";
import { buildSeedBlocks, buildSeedTranslations } from "@/features/siteBuilder/seed";
import { resolveTranslatedField } from "@/utils/resolveTranslatedField";
import type {
	Block,
	PublicSite,
	SiteBankAccount,
	SiteCompanyInfo,
	SiteEditorData,
} from "@/features/siteBuilder/types";
import type { VerificationStatus } from "@/features/verification/types";

type BankAccountRow = {
	bank_name: string | null;
	account_number: string | null;
	account_holder: string | null;
	swift_code: string | null;
	currency: string | null;
};

function toBankAccount(row: BankAccountRow | null): SiteBankAccount {
	return {
		bankName: row?.bank_name ?? "",
		accountNumber: row?.account_number ?? "",
		accountHolder: row?.account_holder ?? "",
		swiftCode: row?.swift_code ?? "",
		currency: row?.currency ?? "KRW",
	};
}

// 사이트빌더 설정 탭과 셀러 설정 페이지의 정산 계좌 섹션이 같은 bank_accounts 대표 계좌를 읽고 쓴다.
export async function getPrimaryBankAccount(
	supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
	profileId: string,
): Promise<SiteBankAccount> {
	const { data } = await supabase
		.from("bank_accounts")
		.select("bank_name, account_number, account_holder, swift_code, currency")
		.eq("profile_id", profileId)
		.eq("is_primary", true)
		.maybeSingle<BankAccountRow>();

	return toBankAccount(data);
}

export async function upsertPrimaryBankAccount(
	admin: Awaited<ReturnType<typeof createServerAdminClient>>,
	profileId: string,
	bankAccount: SiteBankAccount,
): Promise<{ error: string | null }> {
	const { error } = await admin.from("bank_accounts").upsert(
		{
			profile_id: profileId,
			bank_name: bankAccount.bankName,
			account_number: bankAccount.accountNumber,
			account_holder: bankAccount.accountHolder,
			swift_code: bankAccount.swiftCode || null,
			currency: bankAccount.currency || "KRW",
			is_primary: true,
			updated_at: new Date().toISOString(),
		},
		{ onConflict: "profile_id,is_primary" },
	);

	return { error: error?.message ?? null };
}

type CompanyRow = {
	company_name: string | null;
	representative: string | null;
	business_type: string | null;
	business_type_source_lang: string | null;
	business_type_translations: Record<string, string> | null;
	business_item: string | null;
	business_item_source_lang: string | null;
	business_item_translations: Record<string, string> | null;
	business_number: string | null;
	address: string | null;
	site_tenant_id: string | null;
	verification_status: VerificationStatus | null;
};

const COMPANY_COLUMNS =
	"company_name, representative, business_type, business_type_source_lang, business_type_translations, business_item, business_item_source_lang, business_item_translations, business_number, address, site_tenant_id, verification_status";

function toCompanyInfo(row: CompanyRow | null): SiteCompanyInfo {
	return {
		companyName: row?.company_name ?? "",
		representative: row?.representative ?? "",
		businessType: row?.business_type ?? "",
		businessItem: row?.business_item ?? "",
		businessNumber: row?.business_number ?? "",
		address: row?.address ?? "",
	};
}

function toPublicCompanyInfo(row: CompanyRow | null, locale: string): SiteCompanyInfo {
	return {
		...toCompanyInfo(row),
		businessType: resolveTranslatedField(
			row?.business_type ?? "",
			row?.business_type_source_lang ?? null,
			row?.business_type_translations ?? null,
			locale,
		),
		businessItem: resolveTranslatedField(
			row?.business_item ?? "",
			row?.business_item_source_lang ?? null,
			row?.business_item_translations ?? null,
			locale,
		),
	};
}

function toBlocks(value: unknown): Block[] {
	return isBlockArray(value) ? normalizeBlocks(value) : [];
}

export async function getSiteEditorData(): Promise<SiteEditorData | null> {
	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return null;

	const { data: company } = await supabase
		.from("companies")
		.select(COMPANY_COLUMNS)
		.eq("profile_id", user.id)
		.single<CompanyRow>();

	if (!company?.site_tenant_id) return null;

	const [{ data: profile }, { data: contact }, bankAccount] = await Promise.all([
		supabase
			.from("company_profiles")
			.select(
				"logo_url, categories, description, established_year, employee_count, certifications, website_url",
			)
			.eq("profile_id", user.id)
			.maybeSingle(),
		supabase
			.from("contacts")
			.select("name, title, department, email, phone, mobile")
			.eq("profile_id", user.id)
			.maybeSingle(),
		getPrimaryBankAccount(supabase, user.id),
	]);

	const demo = await createServerSupabaseClient("demo");

	const { data: page } = await demo
		.from("site_page")
		.select("id, status, draft_revision_id, published_revision_id")
		.eq("tenant_id", company.site_tenant_id)
		.eq("slug", SITE_PAGE_SLUG)
		.eq("locale", SITE_PAGE_LOCALE)
		.maybeSingle();

	if (!page) return null;

	const revisionId = page.draft_revision_id ?? page.published_revision_id;
	let blocks: Block[] = [];

	if (revisionId) {
		const { data: revision } = await demo
			.from("page_revision")
			.select("blocks")
			.eq("id", revisionId)
			.maybeSingle();

		blocks = toBlocks(revision?.blocks);
	}

	// 아직 블록이 하나도 없으면 기존 기업 프로필 데이터로 첫 초안을 만들어 보여준다.
	// 저장은 사용자가 직접 누를 때 일어난다 — 여기서 쓰지 않는다.
	let isSeeded = false;

	if (blocks.length === 0) {
		const { data: products } = await supabase
			.from("products")
			.select("id, name, description, price_range, image_urls")
			.eq("profile_id", user.id)
			.order("sort_order", { ascending: true });

		const seedTranslations = buildSeedTranslations(
			await getTranslations("ListingCategory"),
			await getTranslations("SiteBuilderSeed"),
		);

		blocks = buildSeedBlocks({
			companyName: company.company_name ?? "",
			representative: company.representative ?? "",
			businessType: company.business_type ?? "",
			businessItem: company.business_item ?? "",
			address: company.address ?? "",
			logoUrl: profile?.logo_url ?? "",
			description: profile?.description ?? "",
			establishedYear: profile?.established_year ?? null,
			employeeCount: profile?.employee_count ?? "",
			certifications: profile?.certifications ?? [],
			categories: profile?.categories ?? [],
			websiteUrl: profile?.website_url ?? "",
			contactName: contact?.name ?? "",
			contactEmail: contact?.email ?? "",
			contactPhone: contact?.phone || contact?.mobile || "",
			products: (products ?? []).map((product) => ({
				id: product.id,
				name: product.name ?? "",
				description: product.description ?? "",
				priceRange: product.price_range ?? "",
				imageUrls: product.image_urls ?? [],
			})),
		}, seedTranslations);

		isSeeded = true;
	}

	return {
		tenantId: company.site_tenant_id,
		profileId: user.id,
		pageId: page.id,
		status: page.status,
		blocks,
		isSeeded,
		hasPublished: page.published_revision_id !== null,
		hasUnpublishedChanges:
			page.draft_revision_id !== null && page.draft_revision_id !== page.published_revision_id,
		settings: {
			logoUrl: profile?.logo_url ?? "",
			categories: profile?.categories ?? [],
			bankAccount,
			company: toCompanyInfo(company),
			contact: {
				name: contact?.name ?? "",
				title: contact?.title ?? "",
				department: contact?.department ?? "",
				email: contact?.email ?? "",
				phone: contact?.phone ?? "",
				mobile: contact?.mobile ?? "",
			},
		},
	};
}

export async function getPublicSite(profileId: string): Promise<PublicSite | null> {
	const admin = await createServerAdminClient();
	const locale = await getLocale();

	const [{ data: company }, { data: profile }] = await Promise.all([
		admin
			.from("companies")
			.select(COMPANY_COLUMNS)
			.eq("profile_id", profileId)
			.single<CompanyRow>(),
		admin.from("company_profiles").select("logo_url").eq("profile_id", profileId).maybeSingle(),
	]);

	if (!company) return null;

	const base: PublicSite = {
		company: toPublicCompanyInfo(company, locale),
		verificationStatus: company.verification_status ?? "unverified",
		logoUrl: profile?.logo_url ?? "",
		blocks: [],
		isPublished: false,
	};

	if (!company.site_tenant_id) return base;

	const demoAdmin = await createServerAdminClient("demo");

	const { data: page, error: pageError } = await demoAdmin
		.from("site_page")
		.select("published_revision_id")
		.eq("tenant_id", company.site_tenant_id)
		.eq("slug", SITE_PAGE_SLUG)
		.eq("locale", SITE_PAGE_LOCALE)
		.maybeSingle();

	// service_role 은 RLS 는 우회해도 GRANT 는 우회하지 못한다.
	// demo 스키마 권한이 없으면 여기서 조용히 빈 페이지가 되므로 남겨 둔다.
	if (pageError) console.error("[getPublicSite] site_page:", pageError.message);
	if (!page?.published_revision_id) return base;

	const { data: revision, error: revisionError } = await demoAdmin
		.from("page_revision")
		.select("blocks")
		.eq("id", page.published_revision_id)
		.maybeSingle();

	if (revisionError) console.error("[getPublicSite] page_revision:", revisionError.message);

	const blocks = toBlocks(revision?.blocks);

	return { ...base, blocks, isPublished: blocks.length > 0 };
}
