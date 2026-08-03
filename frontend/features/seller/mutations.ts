import { createClient } from "@/libs/supabase";
import type { QuoteFormData } from "@/features/seller/types";

export async function postQuote(listingId: string, data: QuoteFormData): Promise<void> {
	const supabase = createClient();

	const { data: { user }, error: userError } = await supabase.auth.getUser();
	if (userError || !user) throw new Error("로그인이 필요합니다.");

	const { error } = await supabase.from("quotes").insert({
		listing_id: listingId,
		seller_id: user.id,
		price: data.price,
		currency: data.currency,
		delivery_days: data.deliveryDays,
		note: data.note,
	});

	if (error) throw error;
}