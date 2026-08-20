"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LISTING_TEMPLATE_QUERY_KEYS } from "@/features/listingTemplates/queries";
import {
	createListingTemplate,
	updateListingTemplate,
	deleteListingTemplate,
} from "@/features/listingTemplates/apis";
import type { ListingTemplateInput } from "@/features/listingTemplates/types";

export function useCreateListingTemplate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: ListingTemplateInput) => createListingTemplate(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: LISTING_TEMPLATE_QUERY_KEYS.all });
		},
	});
}

export function useUpdateListingTemplate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: ListingTemplateInput }) =>
			updateListingTemplate(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: LISTING_TEMPLATE_QUERY_KEYS.all });
		},
	});
}

export function useDeleteListingTemplate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteListingTemplate(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: LISTING_TEMPLATE_QUERY_KEYS.all });
		},
	});
}
