import { createServerSupabaseClient } from "@/libs/supabaseServer";
import { getAuthHeaders } from "@/utils/authHeaders";
import type { Notice, SupportResource } from "@/features/support/types";

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
