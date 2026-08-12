"use client";

import { cva } from "class-variance-authority";
import { Building2, CreditCard, Loader2, Tag } from "lucide-react";
import {
	SiteBuilderImageField,
	SiteBuilderTextField,
} from "@/features/siteBuilder/components/SiteBuilder/SiteBuilderFields";
import { CURRENCY_OPTIONS } from "@/features/siteBuilder/constants";
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from "@/features/buyer/constants";
import type { SiteCompanyInfo, SiteTradeSettings } from "@/features/siteBuilder/types";

type SiteBuilderTradeSettingsProps = {
	company: SiteCompanyInfo;
	settings: SiteTradeSettings;
	isSaving: boolean;
	onChange: (settings: SiteTradeSettings) => void;
	onSave: () => void;
};

const categoryButton = cva(
	"rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
	{
		variants: {
			selected: {
				true: "border-[#3B82F6] bg-[#EFF6FF] text-[#3B82F6]",
				false: "border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50",
			},
		},
		defaultVariants: { selected: false },
	},
);

const SECTION_CLASS = "rounded-2xl border border-[#E5E7EB] bg-white p-6";
const HEADING_CLASS = "flex items-center gap-2 text-sm font-semibold text-[#1F2937]";

export function SiteBuilderTradeSettings({
	company,
	settings,
	isSaving,
	onChange,
	onSave,
}: SiteBuilderTradeSettingsProps): React.JSX.Element {
	const companyFields = [
		{ label: "기업명", value: company.companyName },
		{ label: "대표자", value: company.representative },
		{ label: "업태", value: company.businessType },
		{ label: "종목", value: company.businessItem },
		{ label: "사업자등록번호", value: company.businessNumber },
		{ label: "주소", value: company.address },
	];

	return (
		<div className="space-y-5">
			<div className={SECTION_CLASS}>
				<h2 className={HEADING_CLASS}>
					<Building2 size={16} className="text-[#6B7280]" />
					사업자 정보
				</h2>
				<p className="mb-4 mt-1 text-xs text-[#9CA3AF]">가입 시 등록한 정보입니다. 수정은 지원센터로 문의해주세요.</p>

				<div className="grid grid-cols-2 gap-4 text-sm">
					{companyFields.map((field) => (
						<div key={field.label}>
							<p className="text-[#9CA3AF]">{field.label}</p>
							<p className="mt-0.5 font-medium text-[#374151]">{field.value || "-"}</p>
						</div>
					))}
				</div>
			</div>

			<div className={SECTION_CLASS}>
				<h2 className={HEADING_CLASS}>
					<Tag size={16} className="text-[#6B7280]" />
					취급 카테고리
				</h2>
				<p className="mb-4 mt-1 text-xs text-[#9CA3AF]">
					선택한 카테고리를 기준으로 맞춤 견적요청을 추천해드립니다.
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
							{CATEGORY_LABELS[category]}
						</button>
					))}
				</div>

				<div className="mt-5">
					<SiteBuilderImageField
						label="기업 로고"
						value={settings.logoUrl}
						hint="견적 비교 화면에서 바이어에게 표시됩니다"
						onChange={(logoUrl) => onChange({ ...settings, logoUrl })}
					/>
				</div>
			</div>

			<div className={SECTION_CLASS}>
				<h2 className={HEADING_CLASS}>
					<CreditCard size={16} className="text-[#6B7280]" />
					계좌 정보
				</h2>
				<p className="mb-4 mt-1 text-xs text-[#9CA3AF]">
					인보이스 발행 시 바이어에게 표시됩니다. 국제 송금(T/T) 기준으로 입력해주세요.
				</p>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<SiteBuilderTextField
						label="은행명"
						value={settings.bankAccount.bankName}
						placeholder="예: 국민은행"
						onChange={(bankName) =>
							onChange({ ...settings, bankAccount: { ...settings.bankAccount, bankName } })
						}
					/>
					<div>
						<label className="mb-1.5 block text-xs font-medium text-[#374151]">수취 통화</label>
						<select
							value={settings.bankAccount.currency}
							onChange={(e) =>
								onChange({
									...settings,
									bankAccount: { ...settings.bankAccount, currency: e.target.value },
								})
							}
							className="w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]">
							{CURRENCY_OPTIONS.map((currency) => (
								<option key={currency} value={currency}>
									{currency}
								</option>
							))}
						</select>
					</div>
					<SiteBuilderTextField
						label="계좌번호"
						value={settings.bankAccount.accountNumber}
						placeholder="예: 123-456-789012"
						onChange={(accountNumber) =>
							onChange({ ...settings, bankAccount: { ...settings.bankAccount, accountNumber } })
						}
					/>
					<SiteBuilderTextField
						label="예금주"
						value={settings.bankAccount.accountHolder}
						placeholder="예: 대한정밀공업"
						onChange={(accountHolder) =>
							onChange({ ...settings, bankAccount: { ...settings.bankAccount, accountHolder } })
						}
					/>
					<div className="sm:col-span-2">
						<SiteBuilderTextField
							label="SWIFT 코드"
							value={settings.bankAccount.swiftCode}
							placeholder="예: CZNBKRSE"
							onChange={(swiftCode) =>
								onChange({ ...settings, bankAccount: { ...settings.bankAccount, swiftCode } })
							}
						/>
					</div>
				</div>
			</div>

			<button
				type="button"
				onClick={onSave}
				disabled={isSaving}
				className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B82F6] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60">
				{isSaving && <Loader2 size={15} className="animate-spin" />}
				거래 설정 저장
			</button>
		</div>
	);
}