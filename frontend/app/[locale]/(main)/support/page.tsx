import { SupportHome } from "@/features/support/components/SupportHome";
import { getNotices, getResources } from "@/features/support/serverApis";
import { getMyInquiries } from "@/features/support/inquiryApis";

export default async function SupportPage(): Promise<React.JSX.Element> {
	const [notices, resources, inquiries] = await Promise.all([
		getNotices(5),
		getResources(5),
		getMyInquiries(),
	]);

	return (
		<SupportHome
			notices={notices}
			resources={resources}
			openInquiryCount={inquiries.filter((inquiry) => inquiry.status === "OPEN").length}
		/>
	);
}
