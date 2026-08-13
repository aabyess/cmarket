"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ListingCategorySection from "@/features/buyer/components/PostListingForm/postListing/ListingCategorySection";
import ListingBasicSection from "@/features/buyer/components/PostListingForm/postListing/ListingBasicSection";
import ListingNoteSection from "@/features/buyer/components/PostListingForm/postListing/ListingNoteSection";
import ListingAttachmentSection from "@/features/buyer/components/PostListingForm/postListing/ListingAttachmentSection";
import ListingDeliverySection from "@/features/buyer/components/PostListingForm/postListing/ListingDeliverySection";
import ListingBudgetSection from "@/features/buyer/components/PostListingForm/postListing/ListingBudgetSection";
import ListingContactSection from "@/features/buyer/components/PostListingForm/postListing/ListingContactSection";
import StickyActionBar from "@/features/buyer/components/PostListingForm/postListing/StickyActionBar";
import { postListing, updateListing } from "@/features/buyer/mutations";
import type { ListingFormData } from "@/features/buyer/types";

const DEFAULT_FORM: ListingFormData = {
	title: "",
	category: "office",
	description: "",
	items: [{ id: "default", name: "", spec: "", quantity: 1, unit: "EA", price: 0 }],
	currency: "IDR",
	budgetPublic: false,
	totalBudget: 0,
	endDate: "",
	deliveryDays: 0,
	deliveryMethod: "negotiate",
	deliveryProvinsi: "",
	deliveryCity: "",
	deliveryAddress: "",
	deliveryAddressDetail: "",
	deliveryLat: null,
	deliveryLng: null,
	deliveryTimingMode: "negotiate",
	deliveryDeadlineDate: null,
	attachments: [],
	contactName: "",
	contactPhone: "",
};

type PostListingFormProps = {
	listingId?: string;
	initialData?: ListingFormData;
	contactInfo: { name: string; phone: string };
};

export function PostListingForm({ listingId, initialData, contactInfo }: PostListingFormProps): React.ReactNode {
	const router = useRouter();
	const isEdit = Boolean(listingId);

	const [form, setForm] = useState<ListingFormData>(() => ({
		...DEFAULT_FORM,
		...initialData,
		contactName: initialData?.contactName ?? contactInfo.name,
		contactPhone: initialData?.contactPhone ?? contactInfo.phone,
	}));

	const [isLoading, setIsLoading] = useState(false);

	// 하이드레이션 완료 후에만 초안을 불러와서 서버-클라이언트 렌더링 불일치를 방지
	useEffect(() => {
		if (isEdit) return;

		const draft = localStorage.getItem("listing_draft");
		if (!draft) return;

		try {
			const parsed = JSON.parse(draft) as ListingFormData;
			setForm({
				...DEFAULT_FORM,
				...parsed,
				contactName: contactInfo.name,
				contactPhone: contactInfo.phone,
			});
		} catch {
			// 파싱 실패 시 무시하고 기본값 유지
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function handleChange(patch: Partial<ListingFormData>): void {
		setForm((prev) => ({ ...prev, ...patch }));
	}

	async function handlePublish(): Promise<void> {
		if (!form.title) {
			alert("견적요청 제목을 입력해주세요.");
			return;
		}
		if (form.items.every((item) => !item.name)) {
			alert("품목을 하나 이상 입력해주세요.");
			return;
		}
		if (!form.deliveryProvinsi || !form.deliveryCity) {
			alert("배송지를 입력해주세요.");
			return;
		}

		setIsLoading(true);
		try {
			if (isEdit && listingId) {
				await updateListing(listingId, form);
				router.push(`/buyer/listing/${listingId}`);
			} else {
				await postListing(form);
				localStorage.removeItem("listing_draft");
				router.push("/buyer/dashboard");
			}
		} catch (err) {
			console.error(err);
			alert(isEdit ? "견적요청 수정에 실패했습니다." : "견적요청 등록에 실패했습니다.");
		} finally {
			setIsLoading(false);
		}
	}

	function handleSaveDraft(): void {
		localStorage.setItem("listing_draft", JSON.stringify(form));
		alert("임시저장 완료");
	}

	return (
		<div className="space-y-4 p-6 pb-24 lg:p-10">
			<div>
				<h1 className="text-2xl font-bold text-[#1F2937]">{isEdit ? "견적요청 수정" : "견적요청 등록"}</h1>
				<p className="mt-1 text-sm text-[#6B7280]">
					{isEdit ? "견적요청 내용을 수정합니다." : "한국 공급기업들이 견적을 보내드립니다."}
				</p>
			</div>

			<ListingCategorySection form={form} onChange={handleChange} />
			<ListingBasicSection form={form} onChange={handleChange} />
			<ListingNoteSection form={form} onChange={handleChange} />
			<ListingAttachmentSection form={form} onChange={handleChange} />
			<ListingDeliverySection form={form} onChange={handleChange} />
			<ListingBudgetSection form={form} onChange={handleChange} />
			<ListingContactSection form={form} />

			<StickyActionBar onSaveDraft={handleSaveDraft} onPublish={handlePublish} isLoading={isLoading} />
		</div>
	);
}