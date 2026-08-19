import { cache } from "react";
import Decimal from "decimal.js";
import { createServerSupabaseClient } from "@/libs/supabaseServer";
import type { Currency } from "@/features/buyer/types";

export type ExchangeRateMap = Partial<Record<Currency, Decimal>>;

// 환율은 요청 안에서 여러 서버 함수가 각각 조회하므로 cache()로 요청당 1회만 DB에 간다.
async function fetchExchangeRates(): Promise<ExchangeRateMap> {
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

export const getExchangeRates = cache(fetchExchangeRates);

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