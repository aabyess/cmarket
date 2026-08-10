import Decimal from "decimal.js";
import { createServerSupabaseClient } from "@/libs/supabaseServer";
import type { Currency } from "@/features/buyer/types";

export type ExchangeRateMap = Partial<Record<Currency, Decimal>>;

export async function getExchangeRates(): Promise<ExchangeRateMap> {
	const supabase = await createServerSupabaseClient();
	const { data, error } = await supabase
		.from("exchange_rates")
		.select("target_currency, rate")
		.eq("base_currency", "USD");

	if (error) throw new Error(error.message);

	const rates: ExchangeRateMap = { USD: new Decimal(1) };
	for (const row of data ?? []) {
		rates[row.target_currency as Currency] = new Decimal(row.rate);
	}

	return rates;
}

export function convertCurrency(
	amount: number,
	fromCurrency: Currency,
	toCurrency: Currency,
	rates: ExchangeRateMap,
): number | null {
	if (fromCurrency === toCurrency) return amount;

	const fromRate = rates[fromCurrency];
	const toRate = rates[toCurrency];
	if (!fromRate || !toRate) return null;

	const amountInUsd = new Decimal(amount).dividedBy(fromRate);
	return amountInUsd.times(toRate).toNumber();
}