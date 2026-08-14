"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Clock } from "lucide-react";
import { extendListingDeadline } from "@/features/buyer/mutations";

const EXTEND_OPTIONS = [3, 7, 14, 30];

type ListingExtendDropdownProps = {
	listingId: string;
};

export function ListingExtendDropdown({ listingId }: ListingExtendDropdownProps): React.ReactNode {
	const t = useTranslations("ListingExtendDropdown");
	const router = useRouter();
	const [days, setDays] = useState(7);
	const [isLoading, setIsLoading] = useState(false);

	async function handleExtend(): Promise<void> {
		setIsLoading(true);
		try {
			await extendListingDeadline(listingId, days);
			router.refresh();
		} catch (err) {
			console.error(err);
			alert(t("extendFailed"));
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="flex items-center gap-2">
			<select
				value={days}
				onChange={(e) => setDays(Number(e.target.value))}
				className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#374151] focus:border-imsg-blue focus:outline-none"
			>
				{EXTEND_OPTIONS.map((option) => (
					<option key={option} value={option}>
						{t("extendDays", { days: option })}
					</option>
				))}
			</select>
			<button
				onClick={handleExtend}
				disabled={isLoading}
				className="flex items-center gap-1.5 rounded-lg bg-imsg-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60"
			>
				<Clock size={14} />
				{isLoading ? t("processing") : t("extend")}
			</button>
		</div>
	);
}