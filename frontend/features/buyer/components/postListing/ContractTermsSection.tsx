"use client";

import { useState } from "react";
import SectionWrapper from "@/features/buyer/components/postListing/SectionWrapper";
import DocumentTag from "@/features/buyer/components/postListing/DocumentTag";

const DOCUMENT_TEMPLATES = [
	{ id: "nda", label: "보안 서약서" },
	{ id: "insurance", label: "보험 증서" },
	{ id: "contract", label: "계약서" },
	{ id: "compliance", label: "준수 사항" },
	{ id: "spec", label: "기술 명세서" },
];

interface ContractTermsSectionProps {
	formState: any;
	setFormState: (state: any) => void;
}

export default function ContractTermsSection({ formState, setFormState }: ContractTermsSectionProps) {
	const [newDocumentLabel, setNewDocumentLabel] = useState("");

	const handleChange = (field: string, value: any) => {
		setFormState({ ...formState, contractTerms: { ...formState.contractTerms, [field]: value } });
	};

	const handleAddDocument = () => {
		if (!newDocumentLabel) return;
		const newDoc = { id: Date.now().toString(), label: newDocumentLabel };
		handleChange("contractDocuments", [...formState.contractTerms.contractDocuments, newDoc]);
		setNewDocumentLabel("");
	};

	const handleRemoveDocument = (id: string) => {
		handleChange("contractDocuments", formState.contractTerms.contractDocuments.filter((doc: any) => doc.id !== id));
	};

	const handleAddTemplate = (doc: { id: string; label: string }) => {
		if (formState.contractTerms.contractDocuments.some((d: any) => d.label === doc.label)) return;
		handleChange("contractDocuments", [...formState.contractTerms.contractDocuments, { id: doc.id, label: doc.label }]);
	};

	return (
		<SectionWrapper title="계약 조건" subtitle="계약 관련 세부 사항을 설정하세요">
			<div className="space-y-8">
				<div>
					<label className="block text-sm font-semibold text-gray-900 mb-3">낙찰자 선정 방식</label>
					<select value={formState.contractTerms.winnerSelection} onChange={(e) => handleChange("winnerSelection", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
						<option value="lowest">최저가</option>
						<option value="highest">최고가</option>
						<option value="average">평균가</option>
						<option value="quality">품질 심사</option>
						<option value="combined">종합 심사</option>
					</select>
				</div>

				<div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
					<div className="flex items-center gap-4 mb-4">
						<input type="checkbox" checked={formState.contractTerms.deliveryDeadlineEnabled} onChange={(e) => handleChange("deliveryDeadlineEnabled", e.target.checked)} className="w-4 h-4 text-indigo-600" />
						<label className="text-sm font-medium text-gray-900">납기일자 설정</label>
					</div>
					{formState.contractTerms.deliveryDeadlineEnabled && (
						<input type="datetime-local" value={formState.contractTerms.deliveryDeadline} onChange={(e) => handleChange("deliveryDeadline", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
					)}
				</div>

				<div>
					<label className="block text-sm font-semibold text-gray-900 mb-3">납품 장소</label>
					<input type="text" value={formState.contractTerms.deliveryPlace} onChange={(e) => handleChange("deliveryPlace", e.target.value)} placeholder="납품 장소를 입력하세요" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
				</div>

				<div>
					<label className="block text-sm font-semibold text-gray-900 mb-3">납품 방식</label>
					<select value={formState.contractTerms.deliveryMethod} onChange={(e) => handleChange("deliveryMethod", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
						<option value="pickup">픽업</option>
						<option value="delivery">배송</option>
						<option value="courier">택배</option>
						<option value="mail">우편</option>
						<option value="electronic">전자 인도</option>
					</select>
				</div>

				<div>
					<label className="block text-sm font-semibold text-gray-900 mb-3">결제 방식</label>
					<div className="flex gap-4">
						{[{ value: "bank", label: "계좌 이체" }, { value: "check", label: "수표" }, { value: "card", label: "카드" }].map((method) => (
							<label key={method.value} className="flex items-center gap-2 cursor-pointer">
								<input type="radio" name="paymentMethod" value={method.value} checked={formState.contractTerms.paymentMethod === method.value} onChange={(e) => handleChange("paymentMethod", e.target.value)} className="w-4 h-4 text-indigo-600" />
								<span className="text-sm text-gray-700">{method.label}</span>
							</label>
						))}
					</div>
				</div>

				<div className="flex items-center gap-3 bg-purple-50 p-4 rounded-lg border border-purple-200">
					<input type="checkbox" checked={formState.contractTerms.resultVisible} onChange={(e) => handleChange("resultVisible", e.target.checked)} className="w-4 h-4 text-indigo-600" />
					<label className="text-sm font-medium text-gray-900">결과 공개</label>
				</div>

				<div>
					<label className="block text-sm font-semibold text-gray-900 mb-4">필수 계약 문서</label>
					<div className="mb-4 flex flex-wrap gap-2">
						{DOCUMENT_TEMPLATES.map((doc) => (
							<button key={doc.id} onClick={() => handleAddTemplate(doc)} className="px-3 py-1 text-xs bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors">
								+ {doc.label}
							</button>
						))}
					</div>
					<div className="flex gap-2 mb-4">
						<input type="text" value={newDocumentLabel} onChange={(e) => setNewDocumentLabel(e.target.value)} placeholder="커스텀 문서명 입력" onKeyDown={(e) => { if (e.key === "Enter") handleAddDocument(); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
						<button onClick={handleAddDocument} className="px-4 py-2 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium hover:bg-[#152d54] transition-colors">추가</button>
					</div>
					<div className="flex flex-wrap gap-2">
						{formState.contractTerms.contractDocuments.map((doc: any) => (
							<DocumentTag key={doc.id} label={doc.label} onRemove={() => handleRemoveDocument(doc.id)} />
						))}
					</div>
					{formState.contractTerms.contractDocuments.length === 0 && (
						<p className="text-sm text-gray-500">선택된 문서가 없습니다.</p>
					)}
				</div>
			</div>
		</SectionWrapper>
	);
}