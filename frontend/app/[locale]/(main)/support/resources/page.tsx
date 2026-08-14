import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import { SupportResources } from "@/features/support/components/SupportResources";
import { getResources } from "@/features/support/serverApis";

export default async function SupportResourcesPage(): Promise<React.JSX.Element> {
	const resources = await getResources();

	return (
		<div className="mx-auto max-w-[1200px] px-6 py-6 lg:px-8 xl:px-10">
			<Link
				href="/support"
				className="mb-4 inline-flex items-center gap-1.5 text-sm text-imsg-secondary transition-colors duration-200 hover:text-[#374151]">
				<ChevronLeft size={16} />
				지원센터로
			</Link>

			<div className="mb-5">
				<h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">자료실</h1>
				<p className="mt-1 text-sm text-imsg-secondary">
					계약 서식과 안내 자료 {resources.length}건
				</p>
			</div>

			<SupportResources resources={resources} />
		</div>
	);
}
