"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { deleteListing } from "@/features/buyer/mutations";

type ListingDetailActionsProps = {
	listingId: string;
};

export function ListingDetailActions({ listingId }: ListingDetailActionsProps): React.ReactNode {
	const t = useTranslations("ListingDetailActions");
	const router = useRouter();
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	async function handleDelete(): Promise<void> {
		setIsDeleting(true);
		try {
			await deleteListing(listingId);
			router.push("/buyer/order-list");
		} catch (err) {
			console.error(err);
			alert(t("deleteFailedAlert"));
		} finally {
			setIsDeleting(false);
			setIsConfirmOpen(false);
		}
	}

	return (
		<div className="flex shrink-0 items-center gap-2">
			<Link
				href={`/buyer/listing/${listingId}/edit`}
				className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]">
				<Pencil size={14} />
				{t("edit")}
			</Link>
			<Link
				href={`/buyer/listing/${listingId}/duplicate`}
				className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]">
				<Copy size={14} />
				{t("duplicate")}
			</Link>
			<button
				onClick={() => setIsConfirmOpen(true)}
				className="flex items-center gap-1.5 rounded-lg border border-[#FEE2E2] bg-white px-3.5 py-2 text-xs font-medium text-[#DC2626] transition-colors hover:bg-[#FEF2F2]">
				<Trash2 size={14} />
				{t("delete")}
			</button>

			<ConfirmModal
				isOpen={isConfirmOpen}
				title={t("deleteConfirmTitle")}
				description={t("deleteConfirmDescription")}
				confirmLabel={t("delete")}
				variant="danger"
				isLoading={isDeleting}
				onConfirm={handleDelete}
				onClose={() => setIsConfirmOpen(false)}
			/>
		</div>
	);
}
