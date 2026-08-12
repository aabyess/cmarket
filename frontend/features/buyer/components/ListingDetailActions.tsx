"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { deleteListing } from "@/features/buyer/mutations";

type ListingDetailActionsProps = {
	listingId: string;
};

export function ListingDetailActions({ listingId }: ListingDetailActionsProps): React.ReactNode {
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
			alert("공고 삭제에 실패했습니다.");
		} finally {
			setIsDeleting(false);
			setIsConfirmOpen(false);
		}
	}

	return (
		<div className="flex shrink-0 items-center gap-2">
			<Link
				href={`/buyer/listing/${listingId}/edit`}
				className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]"
			>
				<Pencil size={14} />
				수정
			</Link>
			<button
				onClick={() => setIsConfirmOpen(true)}
				className="flex items-center gap-1.5 rounded-lg border border-[#FEE2E2] bg-white px-3.5 py-2 text-xs font-medium text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
			>
				<Trash2 size={14} />
				삭제
			</button>

			<ConfirmModal
				isOpen={isConfirmOpen}
				title="공고를 삭제할까요?"
				description="삭제 후에는 되돌릴 수 없어요. 받은 견적도 함께 사라집니다."
				confirmLabel="삭제"
				variant="danger"
				isLoading={isDeleting}
				onConfirm={handleDelete}
				onClose={() => setIsConfirmOpen(false)}
			/>
		</div>
	);
}