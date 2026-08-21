import { createServerAdminClient, createServerSupabaseClient } from "@/libs/supabaseServer";
import { getAuthHeaders } from "@/utils/authHeaders";
import type { Notice, SupportResource } from "@/features/support/types";

export type AdminDashboardStats = {
	memberTotal: number;
	buyerCount: number;
	sellerCount: number;
	listingTotal: number;
	listingActiveCount: number;
	listingClosedCount: number;
	quoteTotal: number;
	contractTotal: number;
	contractOngoingCount: number;
	contractCompletedCount: number;
};

export type AdminRecentCompany = {
	id: string;
	companyName: string;
	role: "buyer" | "seller";
	createdAt: string;
};

type NoticeRow = {
	id: string;
	title: string;
	content: string;
	is_pinned: boolean;
	published_at: string | null;
	view_count: number;
	created_at: string;
};

type ResourceRow = {
	id: string;
	title: string;
	description: string | null;
	file_name: string;
	storage_path: string;
	file_size: number;
	download_count: number;
	published_at: string | null;
	created_at: string;
};

function toNotice(row: NoticeRow): Notice {
	return {
		id: row.id,
		title: row.title,
		content: row.content,
		isPinned: row.is_pinned,
		publishedAt: row.published_at,
		viewCount: row.view_count,
		createdAt: row.created_at,
	};
}

function toResource(row: ResourceRow): SupportResource {
	return {
		id: row.id,
		title: row.title,
		description: row.description ?? "",
		fileName: row.file_name,
		storagePath: row.storage_path,
		fileSize: row.file_size,
		downloadCount: row.download_count,
		publishedAt: row.published_at,
		createdAt: row.created_at,
	};
}

const NOTICE_COLUMNS = "id, title, content, is_pinned, published_at, view_count, created_at";
const RESOURCE_COLUMNS =
	"id, title, description, file_name, storage_path, file_size, download_count, published_at, created_at";

export async function getIsAdmin(): Promise<boolean> {
	const authHeaders = await getAuthHeaders();
	if (authHeaders) return authHeaders.role === "admin";

	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return false;

	const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
	return data?.role === "admin";
}

/** 발행된 공지만 돌려준다. 운영자에게는 RLS 가 임시저장분까지 열어 준다. */
export async function getNotices(limit?: number): Promise<Notice[]> {
	const supabase = await createServerSupabaseClient();

	let query = supabase
		.from("notices")
		.select(NOTICE_COLUMNS)
		.not("published_at", "is", null)
		.order("is_pinned", { ascending: false })
		.order("published_at", { ascending: false });

	if (limit) query = query.limit(limit);

	const { data } = await query.returns<NoticeRow[]>();
	return (data ?? []).map(toNotice);
}

export async function getNotice(id: string): Promise<Notice | null> {
	const supabase = await createServerSupabaseClient();
	const { data } = await supabase
		.from("notices")
		.select(NOTICE_COLUMNS)
		.eq("id", id)
		.maybeSingle<NoticeRow>();

	return data ? toNotice(data) : null;
}

export async function getResources(limit?: number): Promise<SupportResource[]> {
	const supabase = await createServerSupabaseClient();

	let query = supabase
		.from("resources")
		.select(RESOURCE_COLUMNS)
		.not("published_at", "is", null)
		.order("published_at", { ascending: false });

	if (limit) query = query.limit(limit);

	const { data } = await query.returns<ResourceRow[]>();
	return (data ?? []).map(toResource);
}

/** 운영자 화면용. 임시저장까지 포함한다. */
export async function getAllNotices(): Promise<Notice[]> {
	const supabase = await createServerSupabaseClient();
	const { data } = await supabase
		.from("notices")
		.select(NOTICE_COLUMNS)
		.order("is_pinned", { ascending: false })
		.order("created_at", { ascending: false })
		.returns<NoticeRow[]>();

	return (data ?? []).map(toNotice);
}

export async function getAllResources(): Promise<SupportResource[]> {
	const supabase = await createServerSupabaseClient();
	const { data } = await supabase
		.from("resources")
		.select(RESOURCE_COLUMNS)
		.order("created_at", { ascending: false })
		.returns<ResourceRow[]>();

	return (data ?? []).map(toResource);
}

/** 관리자 대시보드 지표. 전체 사용자를 대상으로 하므로 서비스롤로 count만 가볍게 조회한다. */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
	const admin = await createServerAdminClient();

	const [
		{ count: buyerCount },
		{ count: sellerCount },
		{ count: listingTotal },
		{ count: listingActiveCount },
		{ count: quoteTotal },
		{ count: contractTotal },
		{ count: contractOngoingCount },
		{ count: contractCompletedCount },
	] = await Promise.all([
		admin.from("profiles").select("*", { count: "exact", head: true }).eq("role", "buyer"),
		admin.from("profiles").select("*", { count: "exact", head: true }).eq("role", "seller"),
		admin.from("listings").select("*", { count: "exact", head: true }),
		admin.from("listings").select("*", { count: "exact", head: true }).eq("status", "active"),
		admin.from("quotes").select("*", { count: "exact", head: true }),
		admin.from("contracts").select("*", { count: "exact", head: true }),
		admin.from("contracts").select("*", { count: "exact", head: true }).eq("status", "ongoing"),
		admin.from("contracts").select("*", { count: "exact", head: true }).eq("status", "completed"),
	]);

	return {
		memberTotal: (buyerCount ?? 0) + (sellerCount ?? 0),
		buyerCount: buyerCount ?? 0,
		sellerCount: sellerCount ?? 0,
		listingTotal: listingTotal ?? 0,
		listingActiveCount: listingActiveCount ?? 0,
		listingClosedCount: (listingTotal ?? 0) - (listingActiveCount ?? 0),
		quoteTotal: quoteTotal ?? 0,
		contractTotal: contractTotal ?? 0,
		contractOngoingCount: contractOngoingCount ?? 0,
		contractCompletedCount: contractCompletedCount ?? 0,
	};
}

/** 최근 가입 기업. companies에는 role이 없어 profiles를 별도 조회해 맵으로 합친다. */
export async function getRecentCompanies(limit: number): Promise<AdminRecentCompany[]> {
	const admin = await createServerAdminClient();

	const { data: companies } = await admin
		.from("companies")
		.select("profile_id, company_name, created_at")
		.order("created_at", { ascending: false })
		.limit(limit);

	if (!companies || companies.length === 0) return [];

	const profileIds = companies.map((c) => c.profile_id);
	const { data: profiles } = await admin.from("profiles").select("id, role").in("id", profileIds);
	const roleMap = new Map((profiles ?? []).map((p) => [p.id, p.role]));

	return companies.map((c) => ({
		id: c.profile_id,
		companyName: c.company_name,
		role: roleMap.get(c.profile_id) === "seller" ? "seller" : "buyer",
		createdAt: c.created_at,
	}));
}
