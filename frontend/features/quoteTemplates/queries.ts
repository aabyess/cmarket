"use client";

import { useQuery } from "@tanstack/react-query";
import { getQuoteTemplates } from "@/features/quoteTemplates/apis";

export const QUOTE_TEMPLATE_QUERY_KEYS = {
	all: ["quoteTemplates"] as const,
};

export function useQuoteTemplates() {
	return useQuery({
		queryKey: QUOTE_TEMPLATE_QUERY_KEYS.all,
		queryFn: getQuoteTemplates,
	});
}
