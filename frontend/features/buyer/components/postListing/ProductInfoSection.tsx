"use client";

import { useState } from "react";
import SectionWrapper from "@/features/buyer/components/postListing/SectionWrapper";

interface Product {
	id: string;
	name: string;
	spec: string;
	quantity: number;
	unit: string;
	unitPrice: number;
}

interface ProductInfoSectionProps {
	formState: any;
	setFormState: (state: any) => void;
}

const UNITS = ["EA", "BOX", "KG", "L", "SET", "M", "기타"];
const PRODUCT_TYPES = ["물품", "공사", "용역", "매각"];

export default function ProductInfoSection({ formState, setFormState }: ProductInfoSectionProps) {
	const handleAddProduct = () => {
		const newProduct: Product = {
			id: Date.now().toString(),
			name: "",
			spec: "",
			quantity: 1,
			unit: "EA",
			unitPrice: 0,
		};
		setFormState({ ...formState, productInfo: { ...formState.productInfo, products: [...formState.productInfo.products, newProduct] } });
	};

	const handleRemoveProduct = (id: string) => {
		setFormState({ ...formState, productInfo: { ...formState.productInfo, products: formState.productInfo.products.filter((p: Product) => p.id !== id) } });
	};

	const handleUpdateProduct = (id: string, field: keyof Product, value: string | number) => {
		setFormState({
			...formState,
			productInfo: {
				...formState.productInfo,
				products: formState.productInfo.products.map((p: Product) => p.id === id ? { ...p, [field]: value } : p),
			},
		});
	};

	const totalAmount = formState.productInfo.products.reduce((sum: number, p: Product) => sum + p.quantity * p.unitPrice, 0);

	return (
		<div className="space-y-4">
			{/* 공고 유형 선택 */}
			<div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
				<div className="flex items-center justify-between">
					<div className="border-l-4 border-[#1B3A6B] pl-4">
						<h2 className="text-base font-bold text-gray-900">공고 유형 선택</h2>
					</div>
					<div className="flex gap-2">
						{PRODUCT_TYPES.map((type) => (
							<button
								key={type}
								onClick={() => setFormState({ ...formState, productInfo: { ...formState.productInfo, productType: type } })}
								className={`px-5 py-2 rounded-lg text-sm font-medium border transition-colors ${
									formState.productInfo.productType === type
										? "bg-[#1B3A6B] text-white border-[#1B3A6B]"
										: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
								}`}>
								{type}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* 품목 섹션 */}
			<div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
				<div className="flex items-center justify-between mb-4">
					<div className="border-l-4 border-[#1B3A6B] pl-4">
						<h2 className="text-base font-bold text-gray-900">{formState.productInfo.productType}</h2>
					</div>
				</div>

				{/* 공고명 입력 */}
				<input
					type="text"
					placeholder="물품을 등록하면 프로젝트 명칭이 자동으로 입력됩니다"
					value={formState.productInfo.announcement}
					onChange={(e) => setFormState({ ...formState, productInfo: { ...formState.productInfo, announcement: e.target.value } })}
					className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none focus:border-[#1B3A6B] mb-4"
				/>

				{/* 품목 테이블 */}
				<div className="border border-gray-200 rounded-lg overflow-hidden">
					<table className="w-full text-sm">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="px-4 py-3 text-left text-xs text-gray-600 font-medium w-12">No.</th>
								<th className="px-4 py-3 text-left text-xs text-gray-600 font-medium">품명</th>
								<th className="px-4 py-3 text-left text-xs text-gray-600 font-medium w-24">수량</th>
								<th className="px-4 py-3 text-left text-xs text-gray-600 font-medium w-28">단위</th>
								<th className="px-4 py-3 text-left text-xs text-gray-600 font-medium w-36">단가 (VAT포함)</th>
								<th className="px-4 py-3 text-right text-xs text-gray-600 font-medium w-24">합계</th>
								<th className="w-8"></th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{formState.productInfo.products.length === 0 ? (
								<tr>
									<td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
										품목을 추가해주세요
									</td>
								</tr>
							) : (
								formState.productInfo.products.map((product: Product, idx: number) => (
									<tr key={product.id} className="hover:bg-gray-50">
										<td className="px-4 py-3 text-gray-500">{idx + 1}</td>
										<td className="px-4 py-3">
											<div className="space-y-1.5">
												<input
													type="text"
													placeholder="품명을 입력하세요"
													value={product.name}
													onChange={(e) => handleUpdateProduct(product.id, "name", e.target.value)}
													className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#1B3A6B]"
												/>
												<input
													type="text"
													placeholder="규격/사양"
													value={product.spec}
													onChange={(e) => handleUpdateProduct(product.id, "spec", e.target.value)}
													className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#1B3A6B]"
												/>
											</div>
										</td>
										<td className="px-4 py-3">
											<input
												type="number"
												min={1}
												value={product.quantity}
												onChange={(e) => handleUpdateProduct(product.id, "quantity", Number(e.target.value))}
												className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#1B3A6B] text-center"
											/>
										</td>
										<td className="px-4 py-3">
											<select
												value={product.unit}
												onChange={(e) => handleUpdateProduct(product.id, "unit", e.target.value)}
												className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#1B3A6B]">
												{UNITS.map((u) => <option key={u}>{u}</option>)}
											</select>
										</td>
										<td className="px-4 py-3">
											<div className="flex items-center gap-1">
												<span className="text-gray-400 text-xs">₩</span>
												<input
													type="number"
													min={0}
													value={product.unitPrice}
													onChange={(e) => handleUpdateProduct(product.id, "unitPrice", Number(e.target.value))}
													className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#1B3A6B]"
												/>
											</div>
										</td>
										<td className="px-4 py-3 text-right text-[#1B3A6B] font-medium">
											₩{(product.quantity * product.unitPrice).toLocaleString()}
										</td>
										<td className="px-4 py-3 text-center">
											<button
												onClick={() => handleRemoveProduct(product.id)}
												className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none">
												×
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>

					{/* 품목 추가하기 */}
					<button
						onClick={handleAddProduct}
						className="w-full py-3 text-sm text-gray-500 hover:bg-gray-50 flex items-center justify-center gap-1.5 border-t border-gray-200 transition-colors">
						<span className="text-base leading-none">+</span>
						품목 추가하기
					</button>
				</div>

				{/* 예정금액 공개 설정 */}
				<div className="mt-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<span className="text-sm text-gray-700">예정금액 공개 설정</span>
						<div className="flex gap-1">
							<button
								onClick={() => setFormState({ ...formState, productInfo: { ...formState.productInfo, priceVisible: true } })}
								className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${formState.productInfo.priceVisible ? "bg-gray-200 text-gray-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
								공개
							</button>
							<button
								onClick={() => setFormState({ ...formState, productInfo: { ...formState.productInfo, priceVisible: false } })}
								className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${!formState.productInfo.priceVisible ? "bg-[#1B3A6B] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
								비공개
							</button>
						</div>
					</div>
					<div className="text-sm text-gray-700">
						총 예정금액 <span className="text-[#1B3A6B] font-semibold ml-1">{totalAmount.toLocaleString()} 원</span>
					</div>
				</div>

				{/* 첨부파일 */}
				<div className="mt-6">
					<div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-[#1B3A6B] transition-colors">
						<input type="file" multiple onChange={(e) => setFormState({ ...formState, productInfo: { ...formState.productInfo, documents: Array.from(e.target.files || []) } })} className="hidden" id="file-upload" />
						<label htmlFor="file-upload" className="cursor-pointer">
							<p className="text-sm text-gray-400">파일 첨부 : 클릭하거나 파일을 드래그 하세요</p>
							<p className="text-xs text-gray-300 mt-1">최대 100MB</p>
						</label>
						{formState.productInfo.documents.length > 0 && (
							<p className="mt-2 text-sm text-gray-600">{formState.productInfo.documents.length}개 파일 선택됨</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}