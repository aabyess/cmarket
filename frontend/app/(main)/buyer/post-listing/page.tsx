"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductInfoSection from "@/features/buyer/components/postListing/ProductInfoSection";
import BiddingConditionsSection from "@/features/buyer/components/postListing/BiddingConditionsSection";
import ContractTermsSection from "@/features/buyer/components/postListing/ContractTermsSection";
import ContactPersonSection from "@/features/buyer/components/postListing/ContactPersonSection";
import StickyActionBar from "@/features/buyer/components/postListing/StickyActionBar";
import { postListing } from "@/features/buyer/mutations";

type Contact = {
	id: string;
	type: "inquiry" | "contract";
	department: string;
	name: string;
	position: string;
	phone: string;
	email: string;
};

const initialFormState = {
	productInfo: {
		productType: "물품",
		products: [{ id: "default", name: "", spec: "", quantity: 1, unit: "EA", unitPrice: 0 }] as any[],
		priceVisible: false,
		announcement: "",
		documents: [] as File[],
	},
	biddingConditions: {
		qualifications: [] as string[],
		regions: [] as string[],
		startDate: "",
		endDate: "",
		submissionType: "sequential",
	},
	contractTerms: {
		winnerSelection: "lowest",
		deliveryDeadlineEnabled: false,
		deliveryDeadline: "",
		deliveryPlace: "",
		deliveryMethod: "delivery",
		paymentMethod: "bank",
		resultVisible: true,
		contractDocuments: [] as { id: string; label: string }[],
	},
	contactPerson: {
		contacts: [] as Contact[],
	},
};

export default function PostListingPage() {
	const router = useRouter();
	const [formState, setFormState] = useState(initialFormState);
	const [isLoading, setIsLoading] = useState(false);

	const handlePublish = async () => {
		if (!formState.biddingConditions.startDate || !formState.biddingConditions.endDate) {
			alert("공고 기간을 설정해주세요.");
			return;
		}
		if (formState.contactPerson.contacts.length === 0) {
			alert("담당자 정보를 입력해주세요.");
			return;
		}

		setIsLoading(true);
		try {
			await postListing({
				type: formState.productInfo.productType as any,
				title: formState.productInfo.announcement || "공고",
				description: formState.productInfo.announcement,
				items: formState.productInfo.products,
				budgetPublic: formState.productInfo.priceVisible,
				totalBudget: formState.productInfo.products.reduce((sum: number, p: any) => sum + p.quantity * p.unitPrice, 0),
				startDate: formState.biddingConditions.startDate,
				endDate: formState.biddingConditions.endDate,
				winnerSelection: formState.contractTerms.winnerSelection,
				deliveryDays: 5,
				contactName: formState.contactPerson.contacts[0]?.name ?? "",
				contactPhone: formState.contactPerson.contacts[0]?.phone ?? "",
				contactEmail: formState.contactPerson.contacts[0]?.email ?? "",
			});
			router.push("/buyer/dashboard");
		}  catch (err) {
            console.error(err);
            alert("공고 등록에 실패했습니다.");
        } finally {
			setIsLoading(false);
		}
	};

	const handleSaveDraft = () => {
		localStorage.setItem("listing_draft", JSON.stringify(formState));
		alert("임시저장 완료");
	};

	return (
		<div className="p-6 lg:p-10 space-y-6 pb-24">
			<h1 className="text-2xl font-bold text-[#1F2937]">공고 등록</h1>
			<ProductInfoSection formState={formState} setFormState={setFormState} />
			<BiddingConditionsSection formState={formState} setFormState={setFormState} />
			<ContractTermsSection formState={formState} setFormState={setFormState} />
			<ContactPersonSection formState={formState} setFormState={setFormState} />
			<StickyActionBar onSaveDraft={handleSaveDraft} onPublish={handlePublish} isLoading={isLoading} />
		</div>
	);
}