import { ListingInfoAttachments } from "@/features/shared/components/ListingInfo/ListingInfoAttachments";
import { ListingInfoDelivery } from "@/features/shared/components/ListingInfo/ListingInfoDelivery";
import { ListingInfoItems } from "@/features/shared/components/ListingInfo/ListingInfoItems";
import type { ListingInfoDeliveryProps } from "@/features/shared/components/ListingInfo/ListingInfoDelivery";
import type { Currency, ListingAttachment, ListingItem } from "@/features/buyer/types";

type ListingInfoProps = {
	listingId: string;
	items: ListingItem[];
	currency: Currency;
	delivery: ListingInfoDeliveryProps;
	attachments: ListingAttachment[];
};

/** 발주 공고의 공통 정보. 발주기업 화면과 공급기업 화면이 같은 내용을 본다. */
export function ListingInfo({
	listingId,
	items,
	currency,
	delivery,
	attachments,
}: ListingInfoProps): React.JSX.Element {
	return (
		<>
			<ListingInfoItems items={items} currency={currency} />
			<ListingInfoDelivery {...delivery} />
			<ListingInfoAttachments listingId={listingId} attachments={attachments} />
		</>
	);
}
