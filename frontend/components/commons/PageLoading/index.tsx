// components/commons/PageLoading/index.tsx
import { Loader2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function PageLoading(): Promise<React.JSX.Element> {
	const t = await getTranslations("PageLoading");

	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-imsg-secondary">
			<Loader2 size={28} className="animate-spin text-imsg-blue" />
			<p className="text-sm">{t("loading")}</p>
		</div>
	);
}
