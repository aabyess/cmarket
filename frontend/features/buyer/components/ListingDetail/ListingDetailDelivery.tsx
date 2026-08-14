import { Link } from "@/i18n/navigation";
import { CalendarClock, ExternalLink, MapPin, Ship, User } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getDeliveryMethodLabels } from "@/features/buyer/constants";
import type { ListingDetailData } from "@/features/buyer/components/ListingDetail/types";

type ListingDetailDeliveryProps = {
	listing: ListingDetailData;
};

export async function ListingDetailDelivery({
	listing,
}: ListingDetailDeliveryProps): Promise<React.JSX.Element> {
	const t = await getTranslations("ListingDetailDelivery");
	const deliveryMethodLabels = getDeliveryMethodLabels(await getTranslations("DeliveryMethod"));

	const fullAddress = [
		listing.deliveryProvinsi,
		listing.deliveryCity,
		listing.deliveryAddress,
		listing.deliveryAddressDetail,
	]
		.filter(Boolean)
		.join(" ");

	const mapUrl =
		listing.deliveryLat !== null && listing.deliveryLng !== null
			? `https://www.google.com/maps/search/?api=1&query=${listing.deliveryLat},${listing.deliveryLng}`
			: null;

	const rows = [
		{
			icon: MapPin,
			label: t("locationLabel"),
			value: fullAddress || t("notEntered"),
			link: mapUrl,
			linkLabel: t("viewOnMap"),
		},
		{
			icon: Ship,
			label: t("methodLabel"),
			value: deliveryMethodLabels[listing.deliveryMethod] ?? t("toBeDiscussed"),
			link: null,
			linkLabel: null,
		},
		{
			icon: CalendarClock,
			label: t("timingLabel"),
			value:
				listing.deliveryTimingMode === "specific" && listing.deliveryDeadlineDate
					? t("deadlineUntil", {
							date: new Date(listing.deliveryDeadlineDate).toLocaleDateString("ko-KR"),
						})
					: listing.deliveryDays > 0
						? t("withinDaysAfterAward", { days: listing.deliveryDays })
						: t("toBeDiscussed"),
			link: null,
			linkLabel: null,
		},
		{
			icon: User,
			label: t("contactLabel"),
			value:
				[listing.contactName, listing.contactPhone].filter(Boolean).join(" · ") || t("notEntered"),
			link: null,
			linkLabel: null,
		},
	];

	return (
		<section className="rounded-2xl bg-white p-6 shadow-sm">
			<h2 className="mb-4 text-base font-semibold text-[#0f172a]">{t("title")}</h2>

			<dl className="space-y-px overflow-hidden rounded-xl bg-[#F2F2F7]">
				{rows.map((row) => (
					<div key={row.label} className="flex items-start gap-4 bg-white px-4 py-3.5">
						<dt className="flex w-28 shrink-0 items-center gap-1.5 text-sm text-imsg-secondary">
							<row.icon size={14} />
							{row.label}
						</dt>
						<dd className="min-w-0 flex-1 text-sm text-[#0f172a]">
							{row.value}
							{row.link && (
								<Link
									href={row.link}
									target="_blank"
									rel="noopener noreferrer"
									className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-imsg-blue hover:underline">
									{row.linkLabel}
									<ExternalLink size={11} />
								</Link>
							)}
						</dd>
					</div>
				))}
			</dl>
		</section>
	);
}
