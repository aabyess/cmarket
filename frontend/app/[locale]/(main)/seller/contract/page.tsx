import { getContracts } from "@/features/contract/apis";
import { ContractList } from "@/features/contract/components/ContractList";

export default async function SellerContractPage() {
	const contracts = await getContracts("seller");
	return (
		<div className="px-8 py-6 xl:px-12">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-[#1F2937]">계약 관리</h1>
				<p className="mt-1 text-sm text-[#6B7280]">진행 중인 계약을 확인하고 관리하세요</p>
			</div>
			<ContractList contracts={contracts} role="seller" />
		</div>
	);
}