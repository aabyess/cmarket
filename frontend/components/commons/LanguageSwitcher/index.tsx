// components/commons/LanguageSwitcher/index.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Globe, Check } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/utils/cn";

export function LanguageSwitcher(): React.JSX.Element {
	const locale = useLocale();
	const t = useTranslations("Locales");
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent): void {
			if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
		}
		if (isOpen) document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	function handleSelect(nextLocale: string): void {
		setIsOpen(false);
		const query = searchParams.toString();
		const href = query ? `${pathname}?${query}` : pathname;
		router.replace(href, { locale: nextLocale });
	}

	return (
		<div className="relative" ref={ref}>
			<button
				onClick={() => setIsOpen((prev) => !prev)}
				className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-[#374151] transition-colors hover:bg-[#F3F4F6]"
			>
				<Globe size={16} />
			</button>

			{isOpen && (
				<div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-[#E5E7EB] bg-white p-1.5 shadow-lg">
					{routing.locales.map((loc) => (
						<button
							key={loc}
							onClick={() => handleSelect(loc)}
							className={cn(
								"flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
								loc === locale
									? "bg-[#EFF6FF] font-medium text-[#3B82F6]"
									: "text-[#374151] hover:bg-[#F9FAFB]",
							)}
						>
							{t(loc)}
							{loc === locale && <Check size={14} />}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
