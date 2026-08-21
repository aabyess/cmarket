// app/[locale]/admin/verifications/page.tsx
import { getTranslations } from "next-intl/server";
import { AdminVerificationQueue } from "@/features/verification/components/AdminVerificationQueue";
import { getVerificationQueue } from "@/features/verification/serverApis";

export default async function AdminVerificationsPage(): Promise<React.JSX.Element> {
	const items = await getVerificationQueue();
	const t = await getTranslations("AdminVerificationsPage");

	return (
		<div className="mx-auto max-w-[1200px] px-6 py-6 lg:px-8">
			<div className="mb-5">
				<h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">{t("title")}</h1>
				<p className="mt-1 text-sm text-imsg-secondary">{t("summary", { count: items.length })}</p>
			</div>

			<AdminVerificationQueue items={items} />
		</div>
	);
}
