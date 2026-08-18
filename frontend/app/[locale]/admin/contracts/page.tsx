import { getTranslations } from "next-intl/server";
import { AdminContractList } from "@/features/contract/components/AdminContractList";
import { getAllContracts } from "@/features/contract/apis";

export default async function AdminContractsPage(): Promise<React.JSX.Element> {
	const contracts = await getAllContracts();
	const t = await getTranslations("AdminContractsPage");

	return (
		<div className="mx-auto max-w-[1200px] px-6 py-6 lg:px-8">
			<div className="mb-5">
				<h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">{t("title")}</h1>
				<p className="mt-1 text-sm text-imsg-secondary">{t("summary", { count: contracts.length })}</p>
			</div>

			<AdminContractList contracts={contracts} />
		</div>
	);
}
