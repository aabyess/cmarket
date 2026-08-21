// features/chat/components/ChatInfoCard/index.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Banknote, MapPin, MapPinned } from "lucide-react";
import { ChatInfoCardMapModal } from "@/features/chat/components/ChatInfoCard/ChatInfoCardMapModal";

type BankAccountInfo = {
	kind: "bankAccount";
	bankName: string;
	accountNumber: string;
	holder: string;
};
// lat/lng는 나중에 추가된 필드라, 이전에 보낸 카드(content에 아예 없음)와의 하위 호환을
// 위해 optional로 둔다 — 없으면 지도 모달 대신 외부 링크로 대체된다.
type AddressInfo = {
	kind: "address";
	provinsi: string;
	city: string;
	address: string;
	lat?: number | null;
	lng?: number | null;
};
type InfoContent = BankAccountInfo | AddressInfo;

function parseInfoContent(content: string): InfoContent | null {
	try {
		const parsed = JSON.parse(content);
		if (parsed?.kind === "bankAccount" || parsed?.kind === "address") return parsed as InfoContent;
		return null;
	} catch {
		return null;
	}
}

type ChatInfoCardProps = {
	content: string;
};

// 계좌번호·주소는 자동 번역으로 왜곡되면 안 되므로, 라벨만 i18n을 쓰고 값은 원문 그대로 보여준다.
export function ChatInfoCard({ content }: ChatInfoCardProps): React.ReactNode {
	const t = useTranslations("ChatInfoCard");
	const info = parseInfoContent(content);
	const [isMapOpen, setIsMapOpen] = useState(false);

	if (!info) return null;

	const rows =
		info.kind === "bankAccount"
			? [
					{ label: t("bankNameLabel"), value: info.bankName },
					{ label: t("accountNumberLabel"), value: info.accountNumber },
					{ label: t("accountHolderLabel"), value: info.holder },
				]
			: [
					{ label: t("provinsiLabel"), value: info.provinsi },
					{ label: t("cityLabel"), value: info.city },
					{ label: t("addressLabel"), value: info.address },
				];

	const fullAddress =
		info.kind === "address" ? [info.provinsi, info.city, info.address].filter(Boolean).join(" ") : "";
	const hasCoords = info.kind === "address" && info.lat != null && info.lng != null;

	function handleAddressClick(): void {
		if (info?.kind !== "address") return;
		// API 키가 없으면 지도 모달을 열어도 어차피 로드에 실패하므로, 열지 않고 바로
		// 외부 링크로 대체한다.
		if (hasCoords && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
			setIsMapOpen(true);
			return;
		}
		window.open(
			`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`,
			"_blank",
			"noopener,noreferrer",
		);
	}

	const cardContent = (
		<>
			<p className="text-imsg-secondary mb-2 flex items-center gap-1.5 text-xs font-semibold">
				{info.kind === "bankAccount" ? <Banknote size={13} /> : <MapPin size={13} />}
				{info.kind === "bankAccount" ? t("bankAccountTitle") : t("addressTitle")}
			</p>
			<div className="space-y-1">
				{rows
					.filter((row) => row.value)
					.map((row) => (
						<div key={row.label} className="flex items-start justify-between gap-3 text-xs">
							<span className="text-imsg-secondary shrink-0">{row.label}</span>
							<span className="text-right font-medium break-all text-[#1F2937]">{row.value}</span>
						</div>
					))}
			</div>
			{info.kind === "address" && (
				<p className="text-imsg-secondary group-hover:text-imsg-blue mt-2 flex items-center gap-1 text-[11px] opacity-0 transition-opacity group-hover:opacity-100">
					<MapPinned size={11} />
					{t("viewOnMapHint")}
				</p>
			)}
		</>
	);

	if (info.kind === "bankAccount") {
		return (
			<div className="w-fit max-w-[280px] rounded-[20px] border border-[#E5E7EB] bg-white p-3.5">
				{cardContent}
			</div>
		);
	}

	return (
		<>
			<button
				type="button"
				onClick={handleAddressClick}
				className="group hover:border-imsg-blue/40 w-fit max-w-[280px] rounded-[20px] border border-[#E5E7EB] bg-white p-3.5 text-left transition-colors">
				{cardContent}
			</button>
			{hasCoords && (
				<ChatInfoCardMapModal
					isOpen={isMapOpen}
					onClose={() => setIsMapOpen(false)}
					lat={info.lat as number}
					lng={info.lng as number}
					address={fullAddress}
				/>
			)}
		</>
	);
}
