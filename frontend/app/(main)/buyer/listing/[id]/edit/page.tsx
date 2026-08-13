import { notFound } from "next/navigation";
import { PostListingForm } from "@/features/buyer/components/PostListingForm";
import { getBuyerContactInfo, getListingDetail } from "@/features/buyer/apis";

type EditListingPageProps = {
	params: Promise<{ id: string }>;
};

export default async function EditListingPage({
	params,
}: EditListingPageProps): Promise<React.JSX.Element> {
	const { id } = await params;
	const [listing, contactInfo] = await Promise.all([getListingDetail(id), getBuyerContactInfo()]);
	if (!listing) notFound();

	return (
		<PostListingForm
			listingId={listing.id}
			contactInfo={contactInfo}
			// 저장된 값을 빠짐없이 싣는다. 일부만 넘기면 수정 저장 시 나머지가 지워진다.
			initialData={{
				title: listing.title,
				category: listing.category,
				description: listing.description,
				items: listing.items,
				currency: listing.currency,
				budgetPublic: listing.budgetPublic,
				totalBudget: listing.totalBudget,
				endDate: listing.endDate,
				deliveryDays: listing.deliveryDays,
				deliveryMethod: listing.deliveryMethod,
				deliveryProvinsi: listing.deliveryProvinsi,
				deliveryCity: listing.deliveryCity,
				deliveryAddress: listing.deliveryAddress,
				deliveryAddressDetail: listing.deliveryAddressDetail,
				deliveryLat: listing.deliveryLat,
				deliveryLng: listing.deliveryLng,
				deliveryTimingMode: listing.deliveryTimingMode,
				deliveryDeadlineDate: listing.deliveryDeadlineDate,
				attachments: listing.attachments,
				contactName: listing.contactName,
				contactPhone: listing.contactPhone,
			}}
		/>
	);
}
