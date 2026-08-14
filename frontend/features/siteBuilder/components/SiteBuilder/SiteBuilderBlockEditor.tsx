"use client";

import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import {
	SiteBuilderImageField,
	SiteBuilderImageListField,
	SiteBuilderSelectField,
	SiteBuilderTagField,
	SiteBuilderTextAreaField,
	SiteBuilderTextField,
} from "@/features/siteBuilder/components/SiteBuilder/SiteBuilderFields";
import {
	HERO_CTA_EMPHASIS_OPTIONS,
	HERO_OVERLAY_OPTIONS,
} from "@/features/siteBuilder/constants";
import { createId } from "@/features/siteBuilder/utils";
import type { Block, HeroCta, ProductItem, StatItem } from "@/features/siteBuilder/types";

type SiteBuilderBlockEditorProps = {
	block: Block;
	onChange: (block: Block) => void;
};

const ADD_BUTTON_CLASS =
	"flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#374151] transition-colors hover:bg-gray-50";

export function SiteBuilderBlockEditor({
	block,
	onChange,
}: SiteBuilderBlockEditorProps): React.JSX.Element {
	const t = useTranslations("SiteBuilderBlockEditor");

	switch (block.type) {
		case "HERO": {
			const current = block;
			const { ctas } = current.props;

			function updateCta(index: number, patch: Partial<HeroCta>): void {
				onChange({
					...current,
					props: {
						...current.props,
						ctas: ctas.map((cta, i) => (i === index ? { ...cta, ...patch } : cta)),
					},
				});
			}

			return (
				<div className="space-y-4">
					<SiteBuilderTextField
						label={t("heroEyebrowLabel")}
						value={current.props.eyebrow}
						placeholder={t("heroEyebrowPlaceholder")}
						onChange={(eyebrow) => onChange({ ...current, props: { ...current.props, eyebrow } })}
					/>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<SiteBuilderTextField
							label={t("heroTitleLabel")}
							value={current.props.title}
							placeholder={t("heroTitlePlaceholder")}
							onChange={(title) => onChange({ ...current, props: { ...current.props, title } })}
						/>
						<SiteBuilderTextField
							label={t("heroTitleAccentLabel")}
							value={current.props.titleAccent}
							placeholder={t("heroTitleAccentPlaceholder")}
							onChange={(titleAccent) =>
								onChange({ ...current, props: { ...current.props, titleAccent } })
							}
						/>
					</div>
					<SiteBuilderTextField
						label={t("heroSubtitleLabel")}
						value={current.props.subtitle}
						placeholder={t("heroSubtitlePlaceholder")}
						onChange={(subtitle) => onChange({ ...current, props: { ...current.props, subtitle } })}
					/>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<SiteBuilderImageField
							label={t("heroLogoLabel")}
							value={current.props.logoUrl}
							hint={t("heroLogoHint")}
							onChange={(logoUrl) => onChange({ ...current, props: { ...current.props, logoUrl } })}
						/>
						<SiteBuilderSelectField
							label={t("heroOverlayLabel")}
							value={current.props.overlay}
							options={HERO_OVERLAY_OPTIONS}
							onChange={(overlay) => onChange({ ...current, props: { ...current.props, overlay } })}
						/>
					</div>

					<SiteBuilderImageListField
						label={t("heroImagesLabel")}
						values={current.props.images}
						onChange={(images) => onChange({ ...current, props: { ...current.props, images } })}
					/>

					<SiteBuilderTagField
						label={t("heroChipsLabel")}
						values={current.props.chips}
						placeholder={t("heroChipsPlaceholder")}
						onChange={(chips) => onChange({ ...current, props: { ...current.props, chips } })}
					/>

					<div className="space-y-2.5">
						<p className="text-xs font-medium text-[#374151]">{t("heroButtonsLabel")}</p>
						{ctas.map((cta, index) => (
							<div key={index} className="flex items-end gap-2">
								<div className="flex-1">
									<SiteBuilderTextField
										label={t("heroCtaLabelLabel")}
										value={cta.label}
										placeholder={t("heroCtaLabelPlaceholder")}
										onChange={(label) => updateCta(index, { label })}
									/>
								</div>
								<div className="flex-1">
									<SiteBuilderTextField
										label={t("heroCtaHrefLabel")}
										value={cta.href}
										placeholder={t("heroCtaHrefPlaceholder")}
										onChange={(href) => updateCta(index, { href })}
									/>
								</div>
								<div className="w-28">
									<SiteBuilderSelectField
										label={t("heroCtaEmphasisLabel")}
										value={cta.emphasis}
										options={HERO_CTA_EMPHASIS_OPTIONS}
										onChange={(emphasis) => updateCta(index, { emphasis })}
									/>
								</div>
								<button
									type="button"
									onClick={() =>
										onChange({
											...current,
											props: { ...current.props, ctas: ctas.filter((_, i) => i !== index) },
										})
									}
									className="mb-2.5 text-[#9CA3AF] transition-colors hover:text-[#DC2626]">
									<X size={16} />
								</button>
							</div>
						))}
						<button
							type="button"
							onClick={() =>
								onChange({
									...current,
									props: {
										...current.props,
										ctas: [...ctas, { label: "", href: "", emphasis: "primary" }],
									},
								})
							}
							className={ADD_BUTTON_CLASS}>
							<Plus size={13} />
							{t("heroAddButton")}
						</button>
					</div>
				</div>
			);
		}

		case "TEXT":
			return (
				<div className="space-y-4">
					<SiteBuilderTextField
						label={t("textHeadingLabel")}
						value={block.props.heading}
						placeholder={t("textHeadingPlaceholder")}
						onChange={(heading) => onChange({ ...block, props: { ...block.props, heading } })}
					/>
					<SiteBuilderTextAreaField
						label={t("textBodyLabel")}
						value={block.props.body}
						placeholder={t("textBodyPlaceholder")}
						onChange={(body) => onChange({ ...block, props: { ...block.props, body } })}
					/>
				</div>
			);

		case "PRODUCTS": {
			const current = block;
			const { items } = current.props;

			function updateItem(id: string, patch: Partial<ProductItem>): void {
				onChange({
					...current,
					props: {
						...current.props,
						items: items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
					},
				});
			}

			return (
				<div className="space-y-4">
					<SiteBuilderTextField
						label={t("productsHeadingLabel")}
						value={block.props.heading}
						placeholder={t("productsHeadingPlaceholder")}
						onChange={(heading) => onChange({ ...block, props: { ...block.props, heading } })}
					/>

					<div className="space-y-3">
						{items.map((item) => (
							<div key={item.id} className="space-y-3 rounded-xl border border-[#F3F4F6] bg-[#F9FAFB] p-4">
								<div className="flex items-start gap-2">
									<div className="flex-1">
										<SiteBuilderTextField
											label={t("productsNameLabel")}
											value={item.name}
											placeholder={t("productsNamePlaceholder")}
											onChange={(name) => updateItem(item.id, { name })}
										/>
									</div>
									<button
										type="button"
										onClick={() =>
											onChange({
												...block,
												props: { ...block.props, items: items.filter((i) => i.id !== item.id) },
											})
										}
										className="mt-6 text-[#9CA3AF] transition-colors hover:text-[#DC2626]">
										<X size={16} />
									</button>
								</div>
								<SiteBuilderTextField
									label={t("productsDescriptionLabel")}
									value={item.description}
									placeholder={t("productsDescriptionPlaceholder")}
									onChange={(description) => updateItem(item.id, { description })}
								/>
								<SiteBuilderTextField
									label={t("productsPriceLabel")}
									value={item.priceRange}
									placeholder={t("productsPricePlaceholder")}
									onChange={(priceRange) => updateItem(item.id, { priceRange })}
								/>
								<SiteBuilderImageListField
									label={t("productsImagesLabel")}
									values={item.imageUrls}
									onChange={(imageUrls) => updateItem(item.id, { imageUrls })}
								/>
							</div>
						))}
						{items.length === 0 && (
							<p className="py-3 text-center text-sm text-[#9CA3AF]">{t("productsEmpty")}</p>
						)}
					</div>

					<button
						type="button"
						onClick={() =>
							onChange({
								...block,
								props: {
									...block.props,
									items: [
										...items,
										{ id: createId(), name: "", description: "", priceRange: "", imageUrls: [] },
									],
								},
							})
						}
						className={ADD_BUTTON_CLASS}>
						<Plus size={13} />
						{t("productsAddButton")}
					</button>
				</div>
			);
		}

		case "CERTIFICATIONS":
			return (
				<div className="space-y-4">
					<SiteBuilderTextField
						label={t("certificationsHeadingLabel")}
						value={block.props.heading}
						placeholder={t("certificationsHeadingPlaceholder")}
						onChange={(heading) => onChange({ ...block, props: { ...block.props, heading } })}
					/>
					<SiteBuilderTagField
						label={t("certificationsItemsLabel")}
						values={block.props.items}
						placeholder={t("certificationsItemsPlaceholder")}
						onChange={(items) => onChange({ ...block, props: { ...block.props, items } })}
					/>
				</div>
			);

		case "CONTACT":
			return (
				<div className="space-y-4">
					<SiteBuilderTextField
						label={t("contactHeadingLabel")}
						value={block.props.heading}
						placeholder={t("contactHeadingPlaceholder")}
						onChange={(heading) => onChange({ ...block, props: { ...block.props, heading } })}
					/>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<SiteBuilderTextField
							label={t("contactManagerLabel")}
							value={block.props.managerName}
							placeholder={t("contactManagerPlaceholder")}
							onChange={(managerName) =>
								onChange({ ...block, props: { ...block.props, managerName } })
							}
						/>
						<SiteBuilderTextField
							label={t("contactEmailLabel")}
							value={block.props.email}
							placeholder={t("contactEmailPlaceholder")}
							onChange={(email) => onChange({ ...block, props: { ...block.props, email } })}
						/>
						<SiteBuilderTextField
							label={t("contactPhoneLabel")}
							value={block.props.phone}
							placeholder={t("contactPhonePlaceholder")}
							onChange={(phone) => onChange({ ...block, props: { ...block.props, phone } })}
						/>
						<SiteBuilderTextField
							label={t("contactAddressLabel")}
							value={block.props.address}
							placeholder={t("contactAddressPlaceholder")}
							onChange={(address) => onChange({ ...block, props: { ...block.props, address } })}
						/>
						<SiteBuilderTextField
							label={t("contactWebsiteLabel")}
							value={block.props.website}
							placeholder={t("contactWebsitePlaceholder")}
							onChange={(website) => onChange({ ...block, props: { ...block.props, website } })}
						/>
					</div>
				</div>
			);

		case "GALLERY":
			return (
				<div className="space-y-4">
					<SiteBuilderTextField
						label={t("galleryHeadingLabel")}
						value={block.props.heading}
						placeholder={t("galleryHeadingPlaceholder")}
						onChange={(heading) => onChange({ ...block, props: { ...block.props, heading } })}
					/>
					<SiteBuilderImageListField
						label={t("galleryImagesLabel")}
						values={block.props.imageUrls}
						onChange={(imageUrls) => onChange({ ...block, props: { ...block.props, imageUrls } })}
					/>
				</div>
			);

		case "STATS": {
			const current = block;
			const { items } = current.props;

			function updateItem(id: string, patch: Partial<StatItem>): void {
				onChange({
					...current,
					props: {
						...current.props,
						items: items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
					},
				});
			}

			return (
				<div className="space-y-4">
					<SiteBuilderTextField
						label={t("statsHeadingLabel")}
						value={block.props.heading}
						placeholder={t("statsHeadingPlaceholder")}
						onChange={(heading) => onChange({ ...block, props: { ...block.props, heading } })}
					/>

					<div className="space-y-2.5">
						{items.map((item) => (
							<div key={item.id} className="flex items-end gap-2">
								<div className="flex-1">
									<SiteBuilderTextField
										label={t("statsValueLabel")}
										value={item.value}
										placeholder={t("statsValuePlaceholder")}
										onChange={(value) => updateItem(item.id, { value })}
									/>
								</div>
								<div className="flex-1">
									<SiteBuilderTextField
										label={t("statsLabelLabel")}
										value={item.label}
										placeholder={t("statsLabelPlaceholder")}
										onChange={(label) => updateItem(item.id, { label })}
									/>
								</div>
								<button
									type="button"
									onClick={() =>
										onChange({
											...block,
											props: { ...block.props, items: items.filter((i) => i.id !== item.id) },
										})
									}
									className="mb-2.5 text-[#9CA3AF] transition-colors hover:text-[#DC2626]">
									<X size={16} />
								</button>
							</div>
						))}
						{items.length === 0 && (
							<p className="py-3 text-center text-sm text-[#9CA3AF]">{t("statsEmpty")}</p>
						)}
					</div>

					<button
						type="button"
						onClick={() =>
							onChange({
								...block,
								props: {
									...block.props,
									items: [...items, { id: createId(), value: "", label: "" }],
								},
							})
						}
						className={ADD_BUTTON_CLASS}>
						<Plus size={13} />
						{t("statsAddButton")}
					</button>
				</div>
			);
		}

		case "CTA":
			return (
				<div className="space-y-4">
					<SiteBuilderTextField
						label={t("ctaHeadingLabel")}
						value={block.props.heading}
						placeholder={t("ctaHeadingPlaceholder")}
						onChange={(heading) => onChange({ ...block, props: { ...block.props, heading } })}
					/>
					<SiteBuilderTextField
						label={t("ctaDescriptionLabel")}
						value={block.props.description}
						placeholder={t("ctaDescriptionPlaceholder")}
						onChange={(description) =>
							onChange({ ...block, props: { ...block.props, description } })
						}
					/>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<SiteBuilderTextField
							label={t("ctaButtonLabelLabel")}
							value={block.props.buttonLabel}
							placeholder={t("ctaButtonLabelPlaceholder")}
							onChange={(buttonLabel) =>
								onChange({ ...block, props: { ...block.props, buttonLabel } })
							}
						/>
						<SiteBuilderTextField
							label={t("ctaButtonHrefLabel")}
							value={block.props.buttonHref}
							placeholder={t("ctaButtonHrefPlaceholder")}
							onChange={(buttonHref) =>
								onChange({ ...block, props: { ...block.props, buttonHref } })
							}
						/>
					</div>
				</div>
			);
	}
}
