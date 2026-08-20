import { createClient } from "@/libs/supabase";
import type { QuoteTemplate, QuoteTemplateInput } from "@/features/quoteTemplates/types";

type QuoteTemplateRow = {
	id: string;
	name: string;
	note: string | null;
	payment_terms: string | null;
	delivery_days: number | null;
	currency: string | null;
	created_at: string;
	updated_at: string;
};

function mapRow(row: QuoteTemplateRow): QuoteTemplate {
	return {
		id: row.id,
		name: row.name,
		note: row.note ?? "",
		paymentTerms: row.payment_terms ?? "",
		deliveryDays: row.delivery_days,
		currency: row.currency,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

export async function getQuoteTemplates(): Promise<QuoteTemplate[]> {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("quote_templates")
		.select("id, name, note, payment_terms, delivery_days, currency, created_at, updated_at")
		.order("name", { ascending: true });

	if (error) throw new Error(error.message);

	return (data ?? []).map((row) => mapRow(row as QuoteTemplateRow));
}

export async function createQuoteTemplate(input: QuoteTemplateInput): Promise<void> {
	const supabase = createClient();

	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	if (userError || !user) throw new Error("로그인이 필요합니다.");

	const { error } = await supabase.from("quote_templates").insert({
		profile_id: user.id,
		name: input.name,
		note: input.note || null,
		payment_terms: input.paymentTerms || null,
		delivery_days: input.deliveryDays,
		currency: input.currency,
	});

	if (error) throw new Error(error.message);
}

export async function updateQuoteTemplate(id: string, input: QuoteTemplateInput): Promise<void> {
	const supabase = createClient();

	const { error } = await supabase
		.from("quote_templates")
		.update({
			name: input.name,
			note: input.note || null,
			payment_terms: input.paymentTerms || null,
			delivery_days: input.deliveryDays,
			currency: input.currency,
			updated_at: new Date().toISOString(),
		})
		.eq("id", id);

	if (error) throw new Error(error.message);
}

export async function deleteQuoteTemplate(id: string): Promise<void> {
	const supabase = createClient();

	const { error } = await supabase.from("quote_templates").delete().eq("id", id);

	if (error) throw new Error(error.message);
}
