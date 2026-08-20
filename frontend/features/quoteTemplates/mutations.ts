"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUOTE_TEMPLATE_QUERY_KEYS } from "@/features/quoteTemplates/queries";
import {
	createQuoteTemplate,
	updateQuoteTemplate,
	deleteQuoteTemplate,
} from "@/features/quoteTemplates/apis";
import type { QuoteTemplateInput } from "@/features/quoteTemplates/types";

export function useCreateQuoteTemplate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: QuoteTemplateInput) => createQuoteTemplate(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: QUOTE_TEMPLATE_QUERY_KEYS.all });
		},
	});
}

export function useUpdateQuoteTemplate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: QuoteTemplateInput }) =>
			updateQuoteTemplate(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: QUOTE_TEMPLATE_QUERY_KEYS.all });
		},
	});
}

export function useDeleteQuoteTemplate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteQuoteTemplate(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: QUOTE_TEMPLATE_QUERY_KEYS.all });
		},
	});
}
