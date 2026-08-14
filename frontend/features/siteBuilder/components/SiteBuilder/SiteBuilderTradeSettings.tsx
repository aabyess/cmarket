"use client";

import { cva } from "class-variance-authority";
import { Building2, CreditCard, ImageIcon, Loader2, Tag, User } from "lucide-react";
import {
	SiteBuilderImageField,
	SiteBuilderTextField,
} from "@/features/siteBuilder/components/SiteBuilder/SiteBuilderFields";
import { CURRENCY_OPTIONS } from "@/features/siteBuilder/constants";
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from "@/features/buyer/constants";
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
					사업자 정보
				</h2>
				<p className={HINT_CLASS}>
					사업자등록번호는 계약서·인보이스에 기재되는 정보라 변경할 수 없습니다. 정정이 필요하면
					지원센터로 문의해주세요.
				</p>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<SiteBuilderTextField
						label="기업명"
						value={settings.company.companyName}
						placeholder="예: 대한정밀공업"
						onChange={(companyName) => updateCompany({ companyName })}
					/>
					<SiteBuilderTextField
						label="대표자"
						value={settings.company.representative}
						placeholder="예: 김대한"
						onChange={(representative) => updateCompany({ representative })}
					/>
					<SiteBuilderTextField
						label="업태"
						value={settings.company.businessType}
						placeholder="예: 제조업"
						onChange={(businessType) => updateCompany({ businessType })}
					/>
					<SiteBuilderTextField
						label="종목"
						value={settings.company.businessItem}
						placeholder="예: 정밀기계부품"
						onChange={(businessItem) => updateCompany({ businessItem })}
					/>
					<div className="sm:col-span-2">
						<SiteBuilderTextField
							label="주소"
							value={settings.company.address}
							placeholder="예: 경기도 안산시 단원구 산단로 123"
							onChange={(address) => updateCompany({ address })}
						/>
					</div>
					<div className="sm:col-span-2">
						<label className="mb-1.5 block text-xs font-medium text-[#374151]">
							사업자등록번호
							<span className="ml-1 text-[#9CA3AF]">(변경 불가)</span>
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
					담당자 정보
				</h2>
				<p className={HINT_CLASS}>견적·계약 진행 시 상대 기업에게 전달되는 연락처입니다.</p>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<SiteBuilderTextField
						label="이름"
						value={settings.contact.name}
						placeholder="예: 김수출"
						onChange={(name) => updateContact({ name })}
					/>
					<SiteBuilderTextField
						label="직함"
						value={settings.contact.title}
						placeholder="예: 과장"
						onChange={(title) => updateContact({ title })}
					/>
					<SiteBuilderTextField
						label="부서"
						value={settings.contact.department}
						placeholder="예: 해외영업팀"
						onChange={(department) => updateContact({ department })}
					/>
					<SiteBuilderTextField
						label="이메일"
						value={settings.contact.email}
						placeholder="예: export@example.com"
						onChange={(email) => updateContact({ email })}
					/>
					<SiteBuilderTextField
						label="휴대폰"
						value={settings.contact.mobile}
						placeholder="예: 010-1234-5678"
						onChange={(mobile) => updateContact({ mobile })}
					/>
					<SiteBuilderTextField
						label="유선 전화"
						value={settings.contact.phone}
						placeholder="예: 031-123-4567"
						onChange={(phone) => updateContact({ phone })}
					/>
				</div>
			</div>

			{role === "seller" && (
				<div className={SECTION_CLASS}>
					<h2 className={HEADING_CLASS}>
						<Tag size={16} className="text-[#6B7280]" />
						취급 카테고리
					</h2>
					<p className={HINT_CLASS}>
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
				</div>
			)}

			<div className={SECTION_CLASS}>
				<h2 className={HEADING_CLASS}>
					<ImageIcon size={16} className="text-[#6B7280]" />
					기업 로고
				</h2>
				<p className={HINT_CLASS}>견적 비교 화면 등 상대 기업에게 보이는 곳에 표시됩니다.</p>
				<SiteBuilderImageField
					label=""
					value={settings.logoUrl}
					hint="정사각형 이미지를 권장합니다"
					onChange={(logoUrl) => onChange({ ...settings, logoUrl })}
				/>
			</div>

			{role === "seller" && (
				<div className={SECTION_CLASS}>
					<h2 className={HEADING_CLASS}>
						<CreditCard size={16} className="text-[#6B7280]" />
						계좌 정보
					</h2>
					<p className={HINT_CLASS}>
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
								className="w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue">
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
			)}

			<button
				type="button"
				onClick={onSave}
				disabled={isSaving}
				className="flex w-full items-center justify-center gap-2 rounded-xl bg-imsg-blue py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60">
				{isSaving && <Loader2 size={15} className="animate-spin" />}
				설정 저장
			</button>
		</div>
	);
}
