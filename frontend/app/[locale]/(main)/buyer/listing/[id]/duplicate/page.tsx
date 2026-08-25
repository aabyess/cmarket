import { notFound } from "next/navigation";
import { PostListingForm } from "@/features/buyer/components/PostListingForm";
import { getBuyerContactInfo, getListingDetail } from "@/features/buyer/apis";

type DuplicateListingPageProps = {
	params: Promise<{ id: string }>;
};

export default async function DuplicateListingPage({
	params,
}: DuplicateListingPageProps): Promise<React.JSX.Element> {
	const { id } = await params;
	const [listing, contactInfo] = await Promise.all([getListingDetail(id), getBuyerContactInfo()]);
	if (!listing) notFound();

	return (
		<PostListingForm
			contactInfo={contactInfo}
			// listingId를 넘기지 않아 수정이 아니라 새 공고 생성 모드로 동작한다.
			// endDate/deliveryDeadlineDate는 예전 마감일을 그대로 들고 오면 이상해서 비운다.
			initialData={{
				title: listing.title,
				category: listing.category,
				description: listing.description,
				items: listing.items,
				currency: listing.currency,
				budgetPublic: listing.budgetPublic,
				totalBudget: listing.totalBudget,
				endDate: "",
				deliveryDays: listing.deliveryDays,
				deliveryMethod: listing.deliveryMethod,
				deliveryProvinsi: listing.deliveryProvinsi,
				deliveryCity: listing.deliveryCity,
				deliveryAddress: listing.deliveryAddress,
				deliveryAddressDetail: listing.deliveryAddressDetail,
				deliveryLat: listing.deliveryLat,
				deliveryLng: listing.deliveryLng,
				deliveryTimingMode: listing.deliveryTimingMode,
				deliveryDeadlineDate: null,
				attachments: listing.attachments,
				contactName: listing.contactName,
				contactPhone: listing.contactPhone,
			}}
		/>
	);
}
