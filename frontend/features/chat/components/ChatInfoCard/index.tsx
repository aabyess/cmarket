// features/chat/components/ChatInfoCard/index.tsx
"use client";

import { useTranslations } from "next-intl";
import { Banknote, MapPin } from "lucide-react";
import { cn } from "@/utils/cn";

type BankAccountInfo = {
	kind: "bankAccount";
	bankName: string;
	accountNumber: string;
	holder: string;
};
type AddressInfo = { kind: "address"; provinsi: string; city: string; address: string };
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
	isMine: boolean;
};

// 계좌번호·주소는 자동 번역으로 왜곡되면 안 되므로, 라벨만 i18n을 쓰고 값은 원문 그대로 보여준다.
export function ChatInfoCard({ content, isMine }: ChatInfoCardProps): React.ReactNode {
	const t = useTranslations("ChatInfoCard");
	const info = parseInfoContent(content);

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

	return (
		<div
			className={cn(
				"w-fit max-w-[280px] rounded-[20px] border border-[#E5E7EB] bg-white p-3.5",
				isMine ? "ml-auto" : "mr-auto",
			)}>
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
		</div>
	);
}
