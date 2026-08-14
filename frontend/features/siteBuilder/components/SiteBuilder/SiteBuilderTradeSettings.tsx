"use client";

import { useTranslations } from "next-intl";
import { cva } from "class-variance-authority";
import { Building2, CreditCard, ImageIcon, Loader2, Tag, User } from "lucide-react";
import {
	SiteBuilderImageField,
	SiteBuilderTextField,
} from "@/features/siteBuilder/components/SiteBuilder/SiteBuilderFields";
import { CURRENCY_OPTIONS } from "@/features/siteBuilder/constants";
import { getCategoryLabels, CATEGORY_OPTIONS } from "@/features/buyer/constants";
import type {
	SiteCompanyInfo,
	SiteContactInfo,
	SiteRole,
	SiteTradeSettings,
} from "@/features/siteBuilder/types";

type SiteBuilderTradeSettingsProps = {
	role: SiteRole;
	settings: SiteTradeSettings;
	isSaving: boolean;
	onChange: (settings: SiteTradeSettings) => void;
	onSave: () => void;
};

const categoryButton = cva("rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors", {
	variants: {
		selected: {
			true: "border-imsg-blue bg-[#EFF6FF] text-imsg-blue",
			false: "border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50",
		},
	},
	defaultVariants: { selected: false },
});

const SECTION_CLASS = "rounded-2xl border border-[#E5E7EB] bg-white p-6";
const HEADING_CLASS = "flex items-center gap-2 text-sm font-semibold text-[#1F2937]";
const HINT_CLASS = "mb-4 mt-1 text-xs text-[#9CA3AF]";

export function SiteBuilderTradeSettings({
	role,
	settings,
	isSaving,
	onChange,
	onSave,
}: SiteBuilderTradeSettingsProps): React.JSX.Element {
	const t = useTranslations("SiteBuilderTradeSettings");
	const categoryLabels = getCategoryLabels(useTranslations("ListingCategory"));

	function updateCompany(patch: Partial<SiteCompanyInfo>): void {
		onChange({ ...settings, company: { ...settings.company, ...patch } });
	}

	function updateContact(patch: Partial<SiteContactInfo>): void {
		onChange({ ...settings, contact: { ...settings.contact, ...patch } });
	}

	return (
		<div className="space-y-5">
			<div className={SECTION_CLASS}>
				<h2 className={HEADING_CLASS}>
					<Building2 size={16} className="text-[#6B7280]" />
					{t("businessInfoTitle")}
				</h2>
				<p className={HINT_CLASS}>
					{t("businessInfoHint")}
				</p>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<SiteBuilderTextField
						label={t("companyNameLabel")}
						value={settings.company.companyName}
						placeholder={t("companyNamePlaceholder")}
						onChange={(companyName) => updateCompany({ companyName })}
					/>
					<SiteBuilderTextField
						label={t("representativeLabel")}
						value={settings.company.representative}
						placeholder={t("representativePlaceholder")}
						onChange={(representative) => updateCompany({ representative })}
					/>
					<SiteBuilderTextField
						label={t("businessTypeLabel")}
						value={settings.company.businessType}
						placeholder={t("businessTypePlaceholder")}
						onChange={(businessType) => updateCompany({ businessType })}
					/>
					<SiteBuilderTextField
						label={t("businessItemLabel")}
						value={settings.company.businessItem}
						placeholder={t("businessItemPlaceholder")}
						onChange={(businessItem) => updateCompany({ businessItem })}
					/>
					<div className="sm:col-span-2">
						<SiteBuilderTextField
							label={t("addressLabel")}
							value={settings.company.address}
							placeholder={t("addressPlaceholder")}
							onChange={(address) => updateCompany({ address })}
						/>
					</div>
					<div className="sm:col-span-2">
						<label className="mb-1.5 block text-xs font-medium text-[#374151]">
							{t("businessNumberLabel")}
							<span className="ml-1 text-[#9CA3AF]">{t("businessNumberUnchangeable")}</span>
						</label>
						<p className="rounded-lg border border-[#F3F4F6] bg-[#F9FAFB] px-3.5 py-2.5 text-sm text-[#6B7280]">
							{settings.company.businessNumber || "-"}
						</p>
					</div>
				</div>
			</div>

			<div className={SECTION_CLASS}>
				<h2 className={HEADING_CLASS}>
					<User size={16} className="text-[#6B7280]" />
					{t("contactInfoTitle")}
				</h2>
				<p className={HINT_CLASS}>{t("contactInfoHint")}</p>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<SiteBuilderTextField
						label={t("nameLabel")}
						value={settings.contact.name}
						placeholder={t("namePlaceholder")}
						onChange={(name) => updateContact({ name })}
					/>
					<SiteBuilderTextField
						label={t("titleLabel")}
						value={settings.contact.title}
						placeholder={t("titlePlaceholder")}
						onChange={(title) => updateContact({ title })}
					/>
					<SiteBuilderTextField
						label={t("departmentLabel")}
						value={settings.contact.department}
						placeholder={t("departmentPlaceholder")}
						onChange={(department) => updateContact({ department })}
					/>
					<SiteBuilderTextField
						label={t("emailLabel")}
						value={settings.contact.email}
						placeholder={t("emailPlaceholder")}
						onChange={(email) => updateContact({ email })}
					/>
					<SiteBuilderTextField
						label={t("mobileLabel")}
						value={settings.contact.mobile}
						placeholder={t("mobilePlaceholder")}
						onChange={(mobile) => updateContact({ mobile })}
					/>
					<SiteBuilderTextField
						label={t("phoneLabel")}
						value={settings.contact.phone}
						placeholder={t("phonePlaceholder")}
						onChange={(phone) => updateContact({ phone })}
					/>
				</div>
			</div>

			{role === "seller" && (
				<div className={SECTION_CLASS}>
					<h2 className={HEADING_CLASS}>
						<Tag size={16} className="text-[#6B7280]" />
						{t("categoryTitle")}
					</h2>
					<p className={HINT_CLASS}>
						{t("categoryHint")}
					</p>

					<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
						{CATEGORY_OPTIONS.map((category) => (
							<button
								key={category}
								type="button"
								onClick={() =>
									onChange({
										...settings,
										categories: settings.categories.includes(category)
											? settings.categories.filter((c) => c !== category)
											: [...settings.categories, category],
									})
								}
								className={categoryButton({ selected: settings.categories.includes(category) })}>
								{categoryLabels[category]}
							</button>
						))}
					</div>
				</div>
			)}

			<div className={SECTION_CLASS}>
				<h2 className={HEADING_CLASS}>
					<ImageIcon size={16} className="text-[#6B7280]" />
					{t("logoTitle")}
				</h2>
				<p className={HINT_CLASS}>{t("logoHint")}</p>
				<SiteBuilderImageField
					label=""
					value={settings.logoUrl}
					hint={t("logoFieldHint")}
					onChange={(logoUrl) => onChange({ ...settings, logoUrl })}
				/>
			</div>

			{role === "seller" && (
				<div className={SECTION_CLASS}>
					<h2 className={HEADING_CLASS}>
						<CreditCard size={16} className="text-[#6B7280]" />
						{t("bankTitle")}
					</h2>
					<p className={HINT_CLASS}>
						{t("bankHint")}
					</p>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<SiteBuilderTextField
							label={t("bankNameLabel")}
							value={settings.bankAccount.bankName}
							placeholder={t("bankNamePlaceholder")}
							onChange={(bankName) =>
								onChange({ ...settings, bankAccount: { ...settings.bankAccount, bankName } })
							}
						/>
						<div>
							<label className="mb-1.5 block text-xs font-medium text-[#374151]">{t("currencyLabel")}</label>
							<select
								value={settings.bankAccount.currency}
								onChange={(e) =>
									onChange({
										...settings,
										bankAccount: { ...settings.bankAccount, currency: e.target.value },
									})
								}
								className="w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue">
								{CURRENCY_OPTIONS.map((currency) => (
									<option key={currency} value={currency}>
										{currency}
									</option>
								))}
							</select>
						</div>
						<SiteBuilderTextField
							label={t("accountNumberLabel")}
							value={settings.bankAccount.accountNumber}
							placeholder={t("accountNumberPlaceholder")}
							onChange={(accountNumber) =>
								onChange({ ...settings, bankAccount: { ...settings.bankAccount, accountNumber } })
							}
						/>
						<SiteBuilderTextField
							label={t("accountHolderLabel")}
							value={settings.bankAccount.accountHolder}
							placeholder={t("accountHolderPlaceholder")}
							onChange={(accountHolder) =>
								onChange({ ...settings, bankAccount: { ...settings.bankAccount, accountHolder } })
							}
						/>
						<div className="sm:col-span-2">
							<SiteBuilderTextField
								label={t("swiftCodeLabel")}
								value={settings.bankAccount.swiftCode}
								placeholder={t("swiftCodePlaceholder")}
								onChange={(swiftCode) =>
									onChange({ ...settings, bankAccount: { ...settings.bankAccount, swiftCode } })
								}
							/>
						</div>
					</div>
				</div>
			)}

			<button
				type="button"
				onClick={onSave}
				disabled={isSaving}
				className="flex w-full items-center justify-center gap-2 rounded-xl bg-imsg-blue py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60">
				{isSaving && <Loader2 size={15} className="animate-spin" />}
				{t("saveButton")}
			</button>
		</div>
	);
}
