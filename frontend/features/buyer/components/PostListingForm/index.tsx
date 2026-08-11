"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ListingBasicSection from "@/features/buyer/components/PostListingForm/postListing/ListingBasicSection";
import ListingBudgetSection from "@/features/buyer/components/PostListingForm/postListing/ListingBudgetSection";
import ListingScheduleSection from "@/features/buyer/components/PostListingForm/postListing/ListingScheduleSection";
import ListingDeliverySection from "@/features/buyer/components/PostListingForm/postListing/ListingDeliverySection";
import StickyActionBar from "@/features/buyer/components/PostListingForm/postListing/StickyActionBar";
import { postListing, updateListing } from "@/features/buyer/mutations";
import type { ListingFormData } from "@/features/buyer/types";

const DEFAULT_FORM: ListingFormData = {
	title: "",
	category: "office",
	description: "",
	items: [{ id: "default", name: "", spec: "", quantity: 1, unit: "EA", price: 0 }],
	currency: "USD",
	budgetPublic: false,
	totalBudget: 0,
	endDate: "",
	deliveryDays: 0,
	deliveryProvinsi: "",
	deliveryCity: "",
	deliveryAddress: "",
};

type PostListingFormProps = {
	listingId?: string;
	initialData?: ListingFormData;
};

export function PostListingForm({ listingId, initialData }: PostListingFormProps): React.ReactNode {
	const router = useRouter();
	const [form, setForm] = useState<ListingFormData>(initialData ?? DEFAULT_FORM);
	const [isLoading, setIsLoading] = useState(false);
	const isEdit = Boolean(listingId);

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
		if (!form.endDate) {
			alert("견적 마감일을 설정해주세요.");
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

			<ListingBasicSection form={form} onChange={handleChange} />
			<ListingBudgetSection form={form} onChange={handleChange} />
			<ListingScheduleSection form={form} onChange={handleChange} />
			<ListingDeliverySection form={form} onChange={handleChange} />

			<StickyActionBar onSaveDraft={handleSaveDraft} onPublish={handlePublish} isLoading={isLoading} />
		</div>
	);
}