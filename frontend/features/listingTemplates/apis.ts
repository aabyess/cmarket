import { createClient } from "@/libs/supabase";
import type { ListingTemplate, ListingTemplateInput } from "@/features/listingTemplates/types";
import type { ListingCategory, ListingItem } from "@/features/buyer/types";

type ListingTemplateRow = {
	id: string;
	name: string;
	category: string | null;
	description: string | null;
	items: ListingItem[] | null;
	currency: string | null;
	created_at: string;
	updated_at: string;
};

function mapRow(row: ListingTemplateRow): ListingTemplate {
	return {
		id: row.id,
		name: row.name,
		category: (row.category as ListingCategory | null) ?? null,
		description: row.description ?? "",
		items: row.items ?? [],
		currency: row.currency,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

export async function getListingTemplates(): Promise<ListingTemplate[]> {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("listing_templates")
		.select("id, name, category, description, items, currency, created_at, updated_at")
		.order("name", { ascending: true });

	if (error) throw new Error(error.message);

	return (data ?? []).map((row) => mapRow(row as ListingTemplateRow));
}

export async function createListingTemplate(input: ListingTemplateInput): Promise<void> {
	const supabase = createClient();

	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	if (userError || !user) throw new Error("로그인이 필요합니다.");

	const { error } = await supabase.from("listing_templates").insert({
		profile_id: user.id,
		name: input.name,
		category: input.category,
		description: input.description || null,
		items: input.items,
		currency: input.currency,
	});

	if (error) throw new Error(error.message);
}

export async function updateListingTemplate(
	id: string,
	input: ListingTemplateInput,
): Promise<void> {
	const supabase = createClient();

	const { error } = await supabase
		.from("listing_templates")
		.update({
			name: input.name,
			category: input.category,
			description: input.description || null,
			items: input.items,
			currency: input.currency,
			updated_at: new Date().toISOString(),
		})
		.eq("id", id);

	if (error) throw new Error(error.message);
}

export async function deleteListingTemplate(id: string): Promise<void> {
	const supabase = createClient();

	const { error } = await supabase.from("listing_templates").delete().eq("id", id);

	if (error) throw new Error(error.message);
}
