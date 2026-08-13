import { createServerAdminClient, createServerSupabaseClient } from "@/libs/supabaseServer";
import type { Inquiry, InquiryReply } from "@/features/support/types";

type InquiryRow = {
	id: string;
	profile_id: string;
	category: Inquiry["category"];
	title: string;
	content: string;
	status: Inquiry["status"];
	answered_at: string | null;
	created_at: string;
};

type ReplyRow = {
	id: string;
	inquiry_id: string;
	content: string;
	is_staff: boolean;
	created_at: string;
};

const INQUIRY_COLUMNS =
	"id, profile_id, category, title, content, status, answered_at, created_at";

function toReply(row: ReplyRow): InquiryReply {
	return {
		id: row.id,
		content: row.content,
		isStaff: row.is_staff,
		createdAt: row.created_at,
	};
}

/**
 * 문의자 표시용 이름. 운영자 화면에서만 필요하다.
 * 문의 목록과 별개 조회인 이유는 profiles → companies/contacts 사이에
 * PostgREST 가 따라갈 관계를 보장할 수 없기 때문이다.
 */
async function getAuthorNames(
	profileIds: string[],
): Promise<Map<string, { name: string; companyName: string }>> {
	const result = new Map<string, { name: string; companyName: string }>();
	if (profileIds.length === 0) return result;

	const admin = await createServerAdminClient();
	const [{ data: companies }, { data: contacts }] = await Promise.all([
		admin.from("companies").select("profile_id, company_name").in("profile_id", profileIds),
		admin.from("contacts").select("profile_id, name").in("profile_id", profileIds),
	]);

	const companyMap = new Map((companies ?? []).map((row) => [row.profile_id, row.company_name]));
	const contactMap = new Map((contacts ?? []).map((row) => [row.profile_id, row.name]));

	for (const id of profileIds) {
		result.set(id, {
			name: contactMap.get(id) ?? "",
			companyName: companyMap.get(id) ?? "",
		});
	}

	return result;
}

async function attachReplies(rows: InquiryRow[]): Promise<Map<string, InquiryReply[]>> {
	const result = new Map<string, InquiryReply[]>();
	if (rows.length === 0) return result;

	const supabase = await createServerSupabaseClient();
	const { data } = await supabase
		.from("support_inquiry_replies")
		.select("id, inquiry_id, content, is_staff, created_at")
		.in(
			"inquiry_id",
			rows.map((row) => row.id),
		)
		.order("created_at", { ascending: true })
		.returns<ReplyRow[]>();

	for (const reply of data ?? []) {
		const list = result.get(reply.inquiry_id) ?? [];
		list.push(toReply(reply));
		result.set(reply.inquiry_id, list);
	}

	return result;
}

function toInquiry(
	row: InquiryRow,
	replies: InquiryReply[],
	author: { name: string; companyName: string },
): Inquiry {
	return {
		id: row.id,
		category: row.category,
		title: row.title,
		content: row.content,
		status: row.status,
		answeredAt: row.answered_at,
		createdAt: row.created_at,
		authorName: author.name,
		authorCompanyName: author.companyName,
		replies,
	};
}

export async function getMyInquiries(): Promise<Inquiry[]> {
	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return [];

	const { data } = await supabase
		.from("support_inquiries")
		.select(INQUIRY_COLUMNS)
		.eq("profile_id", user.id)
		.order("created_at", { ascending: false })
		.returns<InquiryRow[]>();

	const rows = data ?? [];
	const replies = await attachReplies(rows);

	return rows.map((row) => toInquiry(row, replies.get(row.id) ?? [], { name: "", companyName: "" }));
}

export async function getInquiry(id: string): Promise<Inquiry | null> {
	const supabase = await createServerSupabaseClient();
	const { data } = await supabase
		.from("support_inquiries")
		.select(INQUIRY_COLUMNS)
		.eq("id", id)
		.maybeSingle<InquiryRow>();

	if (!data) return null;

	const [replies, authors] = await Promise.all([
		attachReplies([data]),
		getAuthorNames([data.profile_id]),
	]);

	return toInquiry(
		data,
		replies.get(data.id) ?? [],
		authors.get(data.profile_id) ?? { name: "", companyName: "" },
	);
}

/** 운영자 화면용. RLS 가 운영자에게 전체를 열어 준다. */
export async function getAllInquiries(): Promise<Inquiry[]> {
	const supabase = await createServerSupabaseClient();
	const { data } = await supabase
		.from("support_inquiries")
		.select(INQUIRY_COLUMNS)
		.order("created_at", { ascending: false })
		.returns<InquiryRow[]>();

	const rows = data ?? [];
	const [replies, authors] = await Promise.all([
		attachReplies(rows),
		getAuthorNames([...new Set(rows.map((row) => row.profile_id))]),
	]);

	return rows.map((row) =>
		toInquiry(
			row,
			replies.get(row.id) ?? [],
			authors.get(row.profile_id) ?? { name: "", companyName: "" },
		),
	);
}
