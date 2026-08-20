// app/[locale]/(main)/seller/payments/page.tsx
import { getTranslations } from "next-intl/server";
import { getContracts } from "@/features/contract/apis";
import { PaymentsList } from "@/features/payments/components/PaymentsList";

export default async function SellerPaymentsPage(): Promise<React.JSX.Element> {
	const [contracts, t] = await Promise.all([
		getContracts("seller"),
		getTranslations("PaymentsPage"),
	]);

	return (
		<div className="px-8 py-6 xl:px-12">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-[#1F2937]">{t("title")}</h1>
				<p className="mt-1 text-sm text-[#6B7280]">{t("subtitleSeller")}</p>
			</div>
			<PaymentsList contracts={contracts} role="seller" />
		</div>
	);
}
