import { notFound } from "next/navigation";
import { PostListingForm } from "@/features/buyer/components/PostListingForm";
import { getListingDetail } from "@/features/buyer/apis";

type EditListingPageProps = {
	params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: EditListingPageProps) {
	const { id } = await params;
	const listing = await getListingDetail(id);
	if (!listing) notFound();

	return (
		<PostListingForm
			listingId={listing.id}
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
				deliveryProvinsi: listing.deliveryProvinsi,
				deliveryCity: listing.deliveryCity,
				deliveryAddress: listing.deliveryAddress,
			}}
		/>
	);
}