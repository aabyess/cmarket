import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";
import type { Contract } from "@/features/contract/types";

export async function getContracts(role: "buyer" | "seller"): Promise<Contract[]> {
	const supabase = await createServerSupabaseClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return [];

	const filter = role === "buyer" ? "buyer_id" : "seller_id";

	const { data, error } = await supabase
		.from("contracts")
		.select("id, listing_id, quote_id, buyer_id, seller_id, status, created_at, listings(title), quotes(price, currency, delivery_days)")
		.eq(filter, user.id)
		.order("created_at", { ascending: false });

	if (error) throw new Error(error.message);
	if (!data || data.length === 0) return [];

	const partnerIds = data.map((row) =>
		role === "buyer" ? row.seller_id : row.buyer_id,
	);

	const adminSupabase = await createServerAdminClient();

	const { data: companies } = await adminSupabase
		.from("companies")
		.select("profile_id, company_name")
		.in("profile_id", partnerIds);

	const companyMap = new Map((companies ?? []).map((c) => [c.profile_id, c.company_name]));

	return data.map((row) => {
		const listing = row.listings as unknown as { title: string };
		const quote = row.quotes as unknown as { price: number; currency: string; delivery_days: number };
		const partnerId = role === "buyer" ? row.seller_id : row.buyer_id;

		return {
			id: row.id,
			listingId: row.listing_id,
			quoteId: row.quote_id,
			buyerId: row.buyer_id,
			sellerId: row.seller_id,
			status: row.status,
			createdAt: row.created_at,
			listing: { title: listing?.title ?? "" },
			quote: {
				price: Number(quote?.price ?? 0),
				currency: quote?.currency ?? "USD",
				deliveryDays: quote?.delivery_days ?? 0,
			},
			partnerCompanyName: companyMap.get(partnerId) ?? "",
		};
	});
}

export async function updateContractStatus(
	contractId: string,
	status: "completed" | "cancelled",
): Promise<void> {
	const supabase = await createServerSupabaseClient();
	const { error } = await supabase
		.from("contracts")
		.update({ status })
		.eq("id", contractId);
	if (error) throw new Error(error.message);
}