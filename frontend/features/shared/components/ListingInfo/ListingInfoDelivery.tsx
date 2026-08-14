import { Link } from "@/i18n/navigation";
import { CalendarClock, ExternalLink, MapPin, Ship, User } from "lucide-react";
import { DELIVERY_METHOD_LABELS } from "@/features/buyer/constants";
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

export function ListingInfoDelivery(props: ListingInfoDeliveryProps): React.JSX.Element {
	const fullAddress = [props.provinsi, props.city, props.address, props.addressDetail]
		.filter(Boolean)
		.join(" ");

	const mapUrl =
		props.lat !== null && props.lng !== null
			? `https://www.google.com/maps/search/?api=1&query=${props.lat},${props.lng}`
			: null;

	const timing =
		props.timingMode === "specific" && props.deadlineDate
			? `${new Date(props.deadlineDate).toLocaleDateString("ko-KR")}까지`
			: props.deliveryDays > 0
				? `낙찰 후 ${props.deliveryDays}일 이내`
				: "협의 후 결정";

	const rows = [
		{
			icon: MapPin,
			label: "납품 장소",
			value: fullAddress || "미입력",
			link: mapUrl,
		},
		{
			icon: Ship,
			label: "운송 방법",
			value: DELIVERY_METHOD_LABELS[props.method] ?? "협의 후 결정",
			link: null,
		},
		{ icon: CalendarClock, label: "납품 시기", value: timing, link: null },
	];

	if (props.contact) {
		rows.push({
			icon: User,
			label: "담당자",
			value: [props.contact.name, props.contact.phone].filter(Boolean).join(" · ") || "미입력",
			link: null,
		});
	}

	return (
		<section className="rounded-2xl bg-white p-6 shadow-sm">
			<h2 className="mb-4 text-base font-semibold text-[#0f172a]">납품 조건</h2>

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
									지도에서 보기
									<ExternalLink size={11} />
								</Link>
							)}
						</dd>
					</div>
				))}
			</dl>

			{!props.contact && (
				<p className="mt-3 text-xs text-imsg-secondary">
					담당자 연락처는 계약이 확정된 뒤 공개됩니다.
				</p>
			)}
		</section>
	);
}
