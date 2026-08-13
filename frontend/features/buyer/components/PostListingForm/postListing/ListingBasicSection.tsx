"use client";

import SectionWrapper from "@/features/buyer/components/PostListingForm/postListing/SectionWrapper";
import UnitSelect from "@/features/buyer/components/PostListingForm/postListing/UnitSelect";
import type { ListingFormData, ListingItem } from "@/features/buyer/types";

type ListingBasicSectionProps = {
	form: ListingFormData;
	onChange: (patch: Partial<ListingFormData>) => void;
};

export default function ListingBasicSection({ form, onChange }: ListingBasicSectionProps) {
	function handleAddItem() {
		const newItem: ListingItem = {
			id: Date.now().toString(),
			name: "",
			spec: "",
			quantity: 1,
			unit: "EA",
			price: 0,
		};
		onChange({ items: [...form.items, newItem] });
	}

	function handleRemoveItem(id: string) {
		onChange({ items: form.items.filter((item) => item.id !== id) });
	}

	function handleUpdateItem(id: string, field: keyof ListingItem, value: string | number) {
		onChange({
			items: form.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
		});
	}

	return (
		<SectionWrapper title="무엇이 필요하신가요?" subtitle="구매하려는 물품을 알려주세요">
			<div className="space-y-5">
				<div>
					<label className="mb-2 block text-sm font-medium text-[#374151]">
						견적요청 제목 <span className="text-[#3B82F6]">*</span>
					</label>
					<input
						type="text"
						value={form.title}
						onChange={(e) => onChange({ title: e.target.value })}
						placeholder="예: 사무용 프린터 20대 구매"
						className="w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
					/>
				</div>

				<div>
					<label className="mb-2 block text-sm font-medium text-[#374151]">
						품목 <span className="text-[#3B82F6]">*</span>
					</label>
					<div className="overflow-visible rounded-lg border border-[#E2E8F0]">
						<table className="w-full text-sm">
							<thead className="border-b border-[#E2E8F0] bg-[#F9FAFB]">
								<tr>
									<th className="w-10 px-3 py-2.5 text-left text-xs font-medium text-[#6B7280]">
										No.
									</th>
									<th className="px-3 py-2.5 text-left text-xs font-medium text-[#6B7280]">
										품명 / 규격
									</th>
									<th className="w-20 px-3 py-2.5 text-left text-xs font-medium text-[#6B7280]">
										수량
									</th>
									<th className="w-24 px-3 py-2.5 text-left text-xs font-medium text-[#6B7280]">
										단위
									</th>
									<th className="w-8" />
								</tr>
							</thead>
							<tbody className="divide-y divide-[#F3F4F6]">
								{form.items.length === 0 ? (
									<tr>
										<td colSpan={5} className="px-3 py-8 text-center text-sm text-[#9CA3AF]">
											품목을 추가해주세요
										</td>
									</tr>
								) : (
									form.items.map((item, index) => (
										<tr key={item.id} className="hover:bg-[#F9FAFB]">
											<td className="px-3 py-3 text-[#9CA3AF]">{index + 1}</td>
											<td className="px-3 py-3">
												<div className="space-y-1.5">
													<input
														type="text"
														value={item.name}
														onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
														placeholder="품명"
														className="w-full rounded border border-[#E2E8F0] px-3 py-1.5 text-sm focus:border-[#3B82F6] focus:outline-none"
													/>
													<input
														type="text"
														value={item.spec}
														onChange={(e) => handleUpdateItem(item.id, "spec", e.target.value)}
														placeholder="규격 / 사양 (선택)"
														className="w-full rounded border border-[#E2E8F0] px-3 py-1.5 text-sm focus:border-[#3B82F6] focus:outline-none"
													/>
												</div>
											</td>
											<td className="px-3 py-3">
												<input
													type="number"
													min={1}
													value={item.quantity}
													onChange={(e) =>
														handleUpdateItem(item.id, "quantity", Number(e.target.value))
													}
													className="w-full rounded border border-[#E2E8F0] px-2 py-1.5 text-center text-sm focus:border-[#3B82F6] focus:outline-none"
												/>
											</td>
											<td className="px-3 py-3">
												<UnitSelect
													value={item.unit}
													onChange={(value) => handleUpdateItem(item.id, "unit", value)}
												/>
											</td>
											<td className="px-3 py-3 text-center">
												<button
													onClick={() => handleRemoveItem(item.id)}
													className="text-lg leading-none text-[#D1D5DB] transition-colors hover:text-[#EF4444]"
												>
													×
												</button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
						<button
							onClick={handleAddItem}
							className="flex w-full items-center justify-center gap-1.5 border-t border-[#E2E8F0] py-3 text-sm text-[#6B7280] transition-colors hover:bg-[#F9FAFB]"
						>
							<span className="text-base leading-none">+</span>
							품목 추가
						</button>
					</div>
				</div>
			</div>
		</SectionWrapper>
	);
}