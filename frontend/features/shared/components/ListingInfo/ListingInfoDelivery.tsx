import { Link } from "@/i18n/navigation";
import { CalendarClock, ExternalLink, MapPin, Ship, User } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getDeliveryMethodLabels } from "@/features/buyer/constants";
import type { DeliveryMethod, DeliveryTimingMode } from "@/features/buyer/types";

export type ListingInfoDeliveryProps = {
	provinsi: string;
	city: string;
	address: string;
	addressDetail: string;
	method: DeliveryMethod;
	timingMode: DeliveryTimingMode;
	deadlineDate: string | null;
	deliveryDays: number;
	lat: number | null;
	lng: number | null;
	/** 담당자는 계약 성립 후에만 상대에게 제공된다. 볼 수 없는 쪽에는 null 을 넘긴다. */
	contact: { name: string; phone: string } | null;
};

export async function ListingInfoDelivery(props: ListingInfoDeliveryProps): Promise<React.JSX.Element> {
	const t = await getTranslations("ListingInfoDelivery");
	const deliveryMethodLabels = getDeliveryMethodLabels(await getTranslations("DeliveryMethod"));

	const fullAddress = [props.provinsi, props.city, props.address, props.addressDetail]
		.filter(Boolean)
		.join(" ");

	const mapUrl =
		props.lat !== null && props.lng !== null
			? `https://www.google.com/maps/search/?api=1&query=${props.lat},${props.lng}`
			: null;

	const timing =
		props.timingMode === "specific" && props.deadlineDate
			? t("deadlineUntil", { date: new Date(props.deadlineDate).toLocaleDateString("ko-KR") })
			: props.deliveryDays > 0
				? t("afterAwardDays", { days: props.deliveryDays })
				: t("negotiateAfterDecision");

	const rows = [
		{
			icon: MapPin,
			label: t("placeLabel"),
			value: fullAddress || t("notEntered"),
			link: mapUrl,
		},
		{
			icon: Ship,
			label: t("methodLabel"),
			value: deliveryMethodLabels[props.method] ?? t("negotiateAfterDecision"),
			link: null,
		},
		{ icon: CalendarClock, label: t("timingLabel"), value: timing, link: null },
	];

	if (props.contact) {
		rows.push({
			icon: User,
			label: t("contactLabel"),
			value:
				[props.contact.name, props.contact.phone].filter(Boolean).join(" · ") || t("notEntered"),
			link: null,
		});
	}

	return (
		<section className="rounded-2xl bg-white p-6 shadow-sm">
			<h2 className="mb-4 text-base font-semibold text-[#0f172a]">{t("title")}</h2>

			<dl className="space-y-px overflow-hidden rounded-xl bg-[#F2F2F7]">
				{rows.map((row) => (
					<div key={row.label} className="flex items-start gap-4 bg-white px-4 py-3.5">
						<dt className="flex w-24 shrink-0 items-center gap-1.5 text-sm text-imsg-secondary">
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
									{t("viewOnMap")}
									<ExternalLink size={11} />
								</Link>
							)}
						</dd>
					</div>
				))}
			</dl>

			{!props.contact && (
				<p className="mt-3 text-xs text-imsg-secondary">{t("contactHiddenNotice")}</p>
			)}
		</section>
	);
}
