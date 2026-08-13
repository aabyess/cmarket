"use client";

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
						label="상단 작은 문구"
						value={current.props.eyebrow}
						placeholder="예: 정밀 가공 전문"
						onChange={(eyebrow) => onChange({ ...current, props: { ...current.props, eyebrow } })}
					/>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<SiteBuilderTextField
							label="제목"
							value={current.props.title}
							placeholder="예: 대한정밀공업"
							onChange={(title) => onChange({ ...current, props: { ...current.props, title } })}
						/>
						<SiteBuilderTextField
							label="제목 강조 부분"
							value={current.props.titleAccent}
							placeholder="제목 뒤에 강조 색으로 붙습니다"
							onChange={(titleAccent) =>
								onChange({ ...current, props: { ...current.props, titleAccent } })
							}
						/>
					</div>
					<SiteBuilderTextField
						label="한 줄 소개"
						value={current.props.subtitle}
						placeholder="방문자가 30초 안에 이해할 설명을 적어주세요"
						onChange={(subtitle) => onChange({ ...current, props: { ...current.props, subtitle } })}
					/>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<SiteBuilderImageField
							label="로고"
							value={current.props.logoUrl}
							hint="정사각형 권장"
							onChange={(logoUrl) => onChange({ ...current, props: { ...current.props, logoUrl } })}
						/>
						<SiteBuilderSelectField
							label="배경 어둡기"
							value={current.props.overlay}
							options={HERO_OVERLAY_OPTIONS}
							onChange={(overlay) => onChange({ ...current, props: { ...current.props, overlay } })}
						/>
					</div>

					<SiteBuilderImageListField
						label="배경 이미지"
						values={current.props.images}
						onChange={(images) => onChange({ ...current, props: { ...current.props, images } })}
					/>

					<SiteBuilderTagField
						label="강조 태그"
						values={current.props.chips}
						placeholder="예: 산업기계, 수출 12개국"
						onChange={(chips) => onChange({ ...current, props: { ...current.props, chips } })}
					/>

					<div className="space-y-2.5">
						<p className="text-xs font-medium text-[#374151]">버튼</p>
						{ctas.map((cta, index) => (
							<div key={index} className="flex items-end gap-2">
								<div className="flex-1">
									<SiteBuilderTextField
										label="버튼 문구"
										value={cta.label}
										placeholder="예: 문의하기"
										onChange={(label) => updateCta(index, { label })}
									/>
								</div>
								<div className="flex-1">
									<SiteBuilderTextField
										label="링크"
										value={cta.href}
										placeholder="예: #contact"
										onChange={(href) => updateCta(index, { href })}
									/>
								</div>
								<div className="w-28">
									<SiteBuilderSelectField
										label="강조"
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
							버튼 추가
						</button>
					</div>
				</div>
			);
		}

		case "TEXT":
			return (
				<div className="space-y-4">
					<SiteBuilderTextField
						label="소제목"
						value={block.props.heading}
						placeholder="예: 회사 소개"
						onChange={(heading) => onChange({ ...block, props: { ...block.props, heading } })}
					/>
					<SiteBuilderTextAreaField
						label="본문"
						value={block.props.body}
						placeholder="회사 연혁, 생산 역량, 주요 납품 실적 등을 자유롭게 작성하세요"
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
						label="소제목"
						value={block.props.heading}
						placeholder="예: 주요 제품"
						onChange={(heading) => onChange({ ...block, props: { ...block.props, heading } })}
					/>

					<div className="space-y-3">
						{items.map((item) => (
							<div key={item.id} className="space-y-3 rounded-xl border border-[#F3F4F6] bg-[#F9FAFB] p-4">
								<div className="flex items-start gap-2">
									<div className="flex-1">
										<SiteBuilderTextField
											label="제품명"
											value={item.name}
											placeholder="예: 정밀 베어링 하우징"
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
									label="설명"
									value={item.description}
									placeholder="예: SUS304 · 오차 ±0.01mm"
									onChange={(description) => updateItem(item.id, { description })}
								/>
								<SiteBuilderTextField
									label="가격대"
									value={item.priceRange}
									placeholder="예: 100만원~500만원 / 문의"
									onChange={(priceRange) => updateItem(item.id, { priceRange })}
								/>
								<SiteBuilderImageListField
									label="제품 이미지"
									values={item.imageUrls}
									onChange={(imageUrls) => updateItem(item.id, { imageUrls })}
								/>
							</div>
						))}
						{items.length === 0 && (
							<p className="py-3 text-center text-sm text-[#9CA3AF]">제품을 추가해주세요</p>
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
						제품 추가
					</button>
				</div>
			);
		}

		case "CERTIFICATIONS":
			return (
				<div className="space-y-4">
					<SiteBuilderTextField
						label="소제목"
						value={block.props.heading}
						placeholder="예: 인증 및 수상"
						onChange={(heading) => onChange({ ...block, props: { ...block.props, heading } })}
					/>
					<SiteBuilderTagField
						label="인증 · 수상 항목"
						values={block.props.items}
						placeholder="예: ISO 9001, 이노비즈"
						onChange={(items) => onChange({ ...block, props: { ...block.props, items } })}
					/>
				</div>
			);

		case "CONTACT":
			return (
				<div className="space-y-4">
					<SiteBuilderTextField
						label="소제목"
						value={block.props.heading}
						placeholder="예: 문의처"
						onChange={(heading) => onChange({ ...block, props: { ...block.props, heading } })}
					/>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<SiteBuilderTextField
							label="담당자"
							value={block.props.managerName}
							placeholder="예: 김수출 / 해외영업팀 과장"
							onChange={(managerName) =>
								onChange({ ...block, props: { ...block.props, managerName } })
							}
						/>
						<SiteBuilderTextField
							label="이메일"
							value={block.props.email}
							placeholder="예: export@example.com"
							onChange={(email) => onChange({ ...block, props: { ...block.props, email } })}
						/>
						<SiteBuilderTextField
							label="전화"
							value={block.props.phone}
							placeholder="예: +82-31-123-4567"
							onChange={(phone) => onChange({ ...block, props: { ...block.props, phone } })}
						/>
						<SiteBuilderTextField
							label="주소"
							value={block.props.address}
							placeholder="예: 경기도 안산시 단원구 산단로 123"
							onChange={(address) => onChange({ ...block, props: { ...block.props, address } })}
						/>
						<SiteBuilderTextField
							label="홈페이지"
							value={block.props.website}
							placeholder="예: https://example.com"
							onChange={(website) => onChange({ ...block, props: { ...block.props, website } })}
						/>
					</div>
				</div>
			);

		case "GALLERY":
			return (
				<div className="space-y-4">
					<SiteBuilderTextField
						label="소제목"
						value={block.props.heading}
						placeholder="예: 생산 시설"
						onChange={(heading) => onChange({ ...block, props: { ...block.props, heading } })}
					/>
					<SiteBuilderImageListField
						label="이미지"
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
						label="소제목"
						value={block.props.heading}
						placeholder="예: 한눈에 보기"
						onChange={(heading) => onChange({ ...block, props: { ...block.props, heading } })}
					/>

					<div className="space-y-2.5">
						{items.map((item) => (
							<div key={item.id} className="flex items-end gap-2">
								<div className="flex-1">
									<SiteBuilderTextField
										label="숫자"
										value={item.value}
										placeholder="예: 1994"
										onChange={(value) => updateItem(item.id, { value })}
									/>
								</div>
								<div className="flex-1">
									<SiteBuilderTextField
										label="항목명"
										value={item.label}
										placeholder="예: 설립"
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
							<p className="py-3 text-center text-sm text-[#9CA3AF]">항목을 추가해주세요</p>
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
						항목 추가
					</button>
				</div>
			);
		}

		case "CTA":
			return (
				<div className="space-y-4">
					<SiteBuilderTextField
						label="제목"
						value={block.props.heading}
						placeholder="예: 필요한 부품이 있으신가요?"
						onChange={(heading) => onChange({ ...block, props: { ...block.props, heading } })}
					/>
					<SiteBuilderTextField
						label="설명"
						value={block.props.description}
						placeholder="예: 견적 요청을 남기시면 영업일 기준 1일 내 회신드립니다."
						onChange={(description) =>
							onChange({ ...block, props: { ...block.props, description } })
						}
					/>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<SiteBuilderTextField
							label="버튼 문구"
							value={block.props.buttonLabel}
							placeholder="예: 견적 문의하기"
							onChange={(buttonLabel) =>
								onChange({ ...block, props: { ...block.props, buttonLabel } })
							}
						/>
						<SiteBuilderTextField
							label="버튼 링크"
							value={block.props.buttonHref}
							placeholder="비우면 버튼이 표시만 됩니다"
							onChange={(buttonHref) =>
								onChange({ ...block, props: { ...block.props, buttonHref } })
							}
						/>
					</div>
				</div>
			);
	}
}
