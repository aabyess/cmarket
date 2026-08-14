import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { ContactProps } from "@/features/siteBuilder/types";

type SiteRendererContactProps = {
	props: ContactProps;
};

export async function SiteRendererContact({
	props,
}: SiteRendererContactProps): Promise<React.JSX.Element> {
	const t = await getTranslations("SiteRendererContact");
	const items = [
		{ label: t("managerLabel"), value: props.managerName },
		{ label: t("emailLabel"), value: props.email },
		{ label: t("phoneLabel"), value: props.phone },
		{ label: t("addressLabel"), value: props.address },
	].filter((item) => item.value);

	return (
		<section className="rounded-2xl border border-[#E5E7EB] bg-white px-4 sm:px-10 py-8">
			{props.heading && (
				<h3 className="mb-4 text-[17px] font-bold text-[#1F2937]">{props.heading}</h3>
			)}

			<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
				{items.map((item) => (
					<div key={item.label}>
						<p className="text-[11px] text-[#9CA3AF]">{item.label}</p>
						<p className="mt-0.5 text-sm font-medium text-[#374151]">{item.value}</p>
					</div>
				))}

				{props.website && (
					<div>
						<p className="text-[11px] text-[#9CA3AF]">{t("websiteLabel")}</p>
						<Link
							href={props.website}
							target="_blank"
							rel="noopener noreferrer"
							className="mt-0.5 block text-sm font-medium text-imsg-blue hover:underline">
							{props.website}
						</Link>
					</div>
				)}
			</div>
		</section>
	);
}
