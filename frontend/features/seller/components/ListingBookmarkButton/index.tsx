// features/seller/components/ListingBookmarkButton/index.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { cn } from "@/utils/cn";
import { setListingBookmark } from "@/features/seller/mutations";

type ListingBookmarkButtonProps = {
	listingId: string;
	initialBookmarked: boolean;
	size?: "sm" | "md";
	onChange?: (isBookmarked: boolean) => void;
};

export function ListingBookmarkButton({
	listingId,
	initialBookmarked,
	size = "sm",
	onChange,
}: ListingBookmarkButtonProps): React.ReactNode {
	const t = useTranslations("ListingBookmarkButton");
	const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
	const [isSaving, setIsSaving] = useState(false);

	async function handleToggle(e: React.MouseEvent): Promise<void> {
		e.stopPropagation();
		if (isSaving) return;

		const next = !isBookmarked;
		setIsBookmarked(next);
		onChange?.(next);
		setIsSaving(true);
		try {
			await setListingBookmark(listingId, next);
		} catch (err) {
			console.error(err);
			setIsBookmarked(!next);
			onChange?.(!next);
			alert(err instanceof Error && err.message ? err.message : t("errorMessage"));
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<button
			type="button"
			onClick={handleToggle}
			disabled={isSaving}
			aria-label={isBookmarked ? t("removeAria") : t("addAria")}
			aria-pressed={isBookmarked}
			className={cn(
				"flex shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-60",
				size === "sm" ? "size-7" : "size-9",
				isBookmarked
					? "text-amber-400 hover:text-amber-500"
					: "text-[#D1D5DB] hover:text-amber-400",
			)}>
			<Star size={size === "sm" ? 16 : 20} fill={isBookmarked ? "currentColor" : "none"} />
		</button>
	);
}
