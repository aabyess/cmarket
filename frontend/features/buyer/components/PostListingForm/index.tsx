"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, Bookmark, Save } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import ListingCategorySection from "@/features/buyer/components/PostListingForm/postListing/ListingCategorySection";
import ListingBasicSection from "@/features/buyer/components/PostListingForm/postListing/ListingBasicSection";
import ListingNoteSection from "@/features/buyer/components/PostListingForm/postListing/ListingNoteSection";
import ListingAttachmentSection from "@/features/buyer/components/PostListingForm/postListing/ListingAttachmentSection";
import ListingDeliverySection from "@/features/buyer/components/PostListingForm/postListing/ListingDeliverySection";
import ListingBudgetSection from "@/features/buyer/components/PostListingForm/postListing/ListingBudgetSection";
import ListingContactSection from "@/features/buyer/components/PostListingForm/postListing/ListingContactSection";
import StickyActionBar from "@/features/buyer/components/PostListingForm/postListing/StickyActionBar";
import AiDraftModal from "@/features/buyer/components/PostListingForm/postListing/AiDraftModal";
import LoadTemplateModal from "@/features/buyer/components/PostListingForm/postListing/LoadTemplateModal";
import SaveTemplateModal from "@/features/buyer/components/PostListingForm/postListing/SaveTemplateModal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToastStore } from "@/store/useToastStore";
import { postListing, updateListing } from "@/features/buyer/mutations";
import type { Currency, ListingFormData, ListingDraft } from "@/features/buyer/types";
import type { ListingTemplate } from "@/features/listingTemplates/types";

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
	const t = useTranslations("PostListingForm");
	const router = useRouter();
	const showToast = useToastStore((state) => state.showToast);
	const isEdit = Boolean(listingId);

	const [form, setForm] = useState<ListingFormData>(() => ({
		...DEFAULT_FORM,
		...initialData,
		contactName: initialData?.contactName ?? contactInfo.name,
		contactPhone: initialData?.contactPhone ?? contactInfo.phone,
	}));

	const [isLoading, setIsLoading] = useState(false);
	const [isAiModalOpen, setIsAiModalOpen] = useState(false);
	const [pendingAiDraft, setPendingAiDraft] = useState<ListingDraft | null>(null);
	const [isLoadTemplateModalOpen, setIsLoadTemplateModalOpen] = useState(false);
	const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
	const [pendingTemplate, setPendingTemplate] = useState<ListingTemplate | null>(null);

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

	function hasExistingContent(): boolean {
		return (
			Boolean(form.title.trim()) ||
			Boolean(form.description.trim()) ||
			form.items.some((item) => item.name.trim())
		);
	}

	function applyAiDraft(draft: ListingDraft): void {
		handleChange({
			title: draft.title,
			category: draft.category,
			description: draft.description,
			items:
				draft.items.length > 0
					? draft.items.map((item, index) => ({
							id: `ai-${index}-${item.name}`,
							name: item.name,
							spec: item.spec,
							quantity: item.quantity,
							unit: item.unit,
							price: 0,
						}))
					: form.items,
		});
	}

	function handleAiDraftReady(draft: ListingDraft): void {
		if (hasExistingContent()) {
			setPendingAiDraft(draft);
		} else {
			applyAiDraft(draft);
		}
	}

	function handleConfirmAiOverwrite(): void {
		if (pendingAiDraft) applyAiDraft(pendingAiDraft);
		setPendingAiDraft(null);
	}

	function applyTemplate(template: ListingTemplate): void {
		handleChange({
			title: template.title.trim() ? template.title : form.title,
			category: template.category ?? form.category,
			description: template.description,
			items:
				template.items.length > 0
					? template.items.map((item, index) => ({
							...item,
							id: `template-${index}-${item.name}`,
						}))
					: form.items,
			currency: (template.currency as Currency | null) ?? form.currency,
		});
	}

	function handleTemplateReady(template: ListingTemplate): void {
		setIsLoadTemplateModalOpen(false);
		if (hasExistingContent()) {
			setPendingTemplate(template);
		} else {
			applyTemplate(template);
		}
	}

	function handleConfirmTemplateOverwrite(): void {
		if (pendingTemplate) applyTemplate(pendingTemplate);
		setPendingTemplate(null);
	}

	async function handlePublish(): Promise<void> {
		if (!form.title) {
			alert(t("titleRequired"));
			return;
		}
		if (form.items.every((item) => !item.name)) {
			alert(t("itemRequired"));
			return;
		}
		if (!form.deliveryProvinsi || !form.deliveryCity) {
			alert(t("deliveryRequired"));
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
				showToast(t("publishSuccessToast"));
				router.push("/buyer/dashboard");
			}
		} catch (err) {
			console.error(err);
			alert(isEdit ? t("updateFailed") : t("publishFailed"));
		} finally {
			setIsLoading(false);
		}
	}

	function handleSaveDraft(): void {
		localStorage.setItem("listing_draft", JSON.stringify(form));
		alert(t("draftSaved"));
	}

	return (
		<div className="space-y-4 p-6 pb-24 lg:p-10">
			<div className="post-listing-progress-bar" aria-hidden />
			<div className="flex items-start justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold text-[#1F2937]">{isEdit ? t("editTitle") : t("createTitle")}</h1>
					<p className="mt-1 text-sm text-[#6B7280]">
						{isEdit ? t("editSubtitle") : t("createSubtitle")}
					</p>
				</div>
				<div className="flex shrink-0 items-center gap-1.5">
					<button
						onClick={() => setIsSaveTemplateModalOpen(true)}
						className="flex items-center gap-1.5 rounded-lg border border-imsg-blue px-3 py-2 text-xs font-semibold text-imsg-blue transition-colors hover:bg-[#EFF6FF]"
					>
						<Save size={14} />
						{t("templateSaveButton")}
					</button>
					<button
						onClick={() => setIsLoadTemplateModalOpen(true)}
						className="flex items-center gap-1.5 rounded-lg border border-imsg-blue px-3 py-2 text-xs font-semibold text-imsg-blue transition-colors hover:bg-[#EFF6FF]"
					>
						<Bookmark size={14} />
						{t("templateLoadButton")}
					</button>
					<button
						onClick={() => setIsAiModalOpen(true)}
						className="flex items-center gap-1.5 rounded-lg border border-imsg-blue px-3 py-2 text-xs font-semibold text-imsg-blue transition-colors hover:bg-[#EFF6FF]"
					>
						<Sparkles size={14} />
						{t("aiDraftButton")}
					</button>
				</div>
			</div>

			<AiDraftModal
				isOpen={isAiModalOpen}
				onClose={() => setIsAiModalOpen(false)}
				onDraftReady={handleAiDraftReady}
			/>
			<ConfirmModal
				isOpen={pendingAiDraft !== null}
				title={t("aiOverwriteTitle")}
				description={t("aiOverwriteDescription")}
				onConfirm={handleConfirmAiOverwrite}
				onClose={() => setPendingAiDraft(null)}
			/>

			<LoadTemplateModal
				isOpen={isLoadTemplateModalOpen}
				onClose={() => setIsLoadTemplateModalOpen(false)}
				onSelect={handleTemplateReady}
			/>
			<SaveTemplateModal
				isOpen={isSaveTemplateModalOpen}
				title={form.title}
				category={form.category}
				description={form.description}
				items={form.items}
				currency={form.currency}
				onClose={() => setIsSaveTemplateModalOpen(false)}
			/>
			<ConfirmModal
				isOpen={pendingTemplate !== null}
				title={t("templateOverwriteTitle")}
				description={t("templateOverwriteDescription")}
				onConfirm={handleConfirmTemplateOverwrite}
				onClose={() => setPendingTemplate(null)}
			/>

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
