import type { ListingFormData, ListingStatus } from "@/features/buyer/types";

export type ListingDetailData = ListingFormData & {
	id: string;
	status: ListingStatus;
	createdAt: string;
};
