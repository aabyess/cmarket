import { createClient } from "jsr:@supabase/supabase-js@2";

const RATE_API_URL = "https://open.er-api.com/v6/latest/USD";
const TARGET_CURRENCIES = ["KRW", "IDR"] as const;

type RateApiResponse = {
	result: string;
	rates: Record<string, number>;
};

Deno.serve(async () => {
	const res = await fetch(RATE_API_URL);
	if (!res.ok) {
		return new Response(JSON.stringify({ error: "환율 API 호출 실패" }), { status: 502 });
	}

	const data = (await res.json()) as RateApiResponse;
	if (data.result !== "success") {
		return new Response(JSON.stringify({ error: "환율 API 응답 오류" }), { status: 502 });
	}

	const supabase = createClient(
		Deno.env.get("SUPABASE_URL")!,
		Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
	);

	const rows = TARGET_CURRENCIES.map((currency) => ({
		base_currency: "USD",
		target_currency: currency,
		rate: data.rates[currency],
		updated_at: new Date().toISOString(),
	}));

	const { error } = await supabase
		.from("exchange_rates")
		.upsert(rows, { onConflict: "base_currency,target_currency" });

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}

	return new Response(JSON.stringify({ success: true, rows }), { status: 200 });
});