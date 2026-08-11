import { PostListingForm } from "@/features/buyer/components/PostListingForm";
import { getBuyerContactInfo } from "@/features/buyer/apis";

export default async function PostListingPage() {
	const contactInfo = await getBuyerContactInfo();

	return (
		<div className="px-8 py-6 xl:px-12">
			<PostListingForm contactInfo={contactInfo} />
		</div>
	);
}