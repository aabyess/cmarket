import { getTranslations } from "next-intl/server";
import { getContracts } from "@/features/contract/apis";
import { ContractList } from "@/features/contract/components/ContractList";

export default async function BuyerContractPage() {
	const [contracts, t] = await Promise.all([getContracts("buyer"), getTranslations("ContractPage")]);
	return (
		<div className="px-8 py-6 xl:px-12">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-[#1F2937]">{t("title")}</h1>
				<p className="mt-1 text-sm text-[#6B7280]">{t("description")}</p>
			</div>
			<ContractList contracts={contracts} role="buyer" />
		</div>
	);
}