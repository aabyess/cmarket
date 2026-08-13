import { AdminResources } from "@/features/support/components/AdminResources";
import { getAllResources } from "@/features/support/serverApis";

export default async function AdminResourcesPage(): Promise<React.JSX.Element> {
	const resources = await getAllResources();

	return (
		<div className="mx-auto max-w-[900px] px-6 py-6 lg:px-8">
			<div className="mb-5">
				<h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">자료실</h1>
				<p className="mt-1 text-sm text-imsg-secondary">{resources.length}건</p>
			</div>

			<AdminResources resources={resources} />
		</div>
	);
}
