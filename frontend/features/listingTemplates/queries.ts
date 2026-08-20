"use client";

import { useQuery } from "@tanstack/react-query";
import { getListingTemplates } from "@/features/listingTemplates/apis";

export const LISTING_TEMPLATE_QUERY_KEYS = {
	all: ["listingTemplates"] as const,
};

export function useListingTemplates() {
	return useQuery({
		queryKey: LISTING_TEMPLATE_QUERY_KEYS.all,
		queryFn: getListingTemplates,
	});
}
