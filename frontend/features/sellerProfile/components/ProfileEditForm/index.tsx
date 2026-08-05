"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Building2, FileText, Globe, Award, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { uploadImage } from "@/features/sellerProfile/utils";
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from "@/features/buyer/constants";
import type { SellerProfileData } from "@/features/sellerProfile/types";

type ProfileEditFormProps = {
	data: SellerProfileData;
};

const EMPLOYEE_COUNT_OPTIONS = [
	"1-10명", "11-50명", "51-100명", "101-300명", "301-500명", "500명 이상",
];

type ProductDraft = {
	id: string;
	name: string;
	description: string | null;
	imageUrls: string[];
	priceRange: string | null;
	sortOrder: number;
	isNew: boolean;
};

export function ProfileEditForm({ data }: ProfileEditFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [isSaved, setIsSaved] = useState(false);
	const logoInputRef = useRef<HTMLInputElement>(null);

	const [logoUrl, setLogoUrl] = useState(data.profile?.logoUrl ?? "");
	const [logoUploading, setLogoUploading] = useState(false);
	const [description, setDescription] = useState(data.profile?.description ?? "");
	const [categories, setCategories] = useState<string[]>(data.profile?.categories ?? []);
	const [establishedYear, setEstablishedYear] = useState(
		data.profile?.establishedYear?.toString() ?? "",
	);
	const [employeeCount, setEmployeeCount] = useState(data.profile?.employeeCount ?? "");
	const [websiteUrl, setWebsiteUrl] = useState(data.profile?.websiteUrl ?? "");
	const [certifications, setCertifications] = useState<string[]>(
		data.profile?.certifications ?? [],
	);
	const [certInput, setCertInput] = useState("");
	const [products, setProducts] = useState<ProductDraft[]>(
		data.products.map((p) => ({ ...p, isNew: false })),
	);

	async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		setLogoUploading(true);
		try {
			const url = await uploadImage(file, "company-logos", "logos");
			setLogoUrl(url);
		} catch (err) {
			console.error(err);
			alert("로고 업로드 중 오류가 발생했습니다.");
		} finally {
			setLogoUploading(false);
		}
	}

	async function handleProductImageUpload(productId: string, e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		try {
			const url = await uploadImage(file, "product-images", "products");
			setProducts(products.map((p) =>
				p.id === productId ? { ...p, imageUrls: [...p.imageUrls, url] } : p,
			));
		} catch (err) {
			console.error(err);
			alert("이미지 업로드 중 오류가 발생했습니다.");
		}
	}

	function handleRemoveProductImage(productId: string, imageUrl: string) {
		setProducts(products.map((p) =>
			p.id === productId
				? { ...p, imageUrls: p.imageUrls.filter((u) => u !== imageUrl) }
				: p,
		));
	}

	function handleToggleCategory(cat: string) {
		setCategories((prev) =>
			prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
		);
	}

	function handleAddCert() {
		const val = certInput.trim();
		setCertInput("");
		if (!val || certifications.includes(val)) return;
		setCertifications((prev) => [...prev, val]);
	}

	function handleRemoveCert(cert: string) {
		setCertifications(certifications.filter((c) => c !== cert));
	}

	function handleAddProduct() {
		setProducts([
			...products,
			{
				id: `new-${Date.now()}`,
				name: "",
				description: null,
				imageUrls: [],
				priceRange: null,
				sortOrder: products.length,
				isNew: true,
			},
		]);
	}

	function handleRemoveProduct(id: string) {
		setProducts(products.filter((p) => p.id !== id));
	}

	function handleProductChange(id: string, field: string, value: string) {
		setProducts(products.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
	}

	async function handleSubmit() {
		setIsLoading(true);
		try {
			const res = await fetch("/api/seller/profile", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					logoUrl,
					description,
					establishedYear: establishedYear ? parseInt(establishedYear) : null,
					employeeCount,
					websiteUrl,
					certifications,
					categories,
					products: products.map((p) => ({
						id: p.isNew ? null : p.id,
						name: p.name,
						description: p.description,
						imageUrls: p.imageUrls,
						priceRange: p.priceRange,
						sortOrder: p.sortOrder,
					})),
				}),
			});

			if (!res.ok) {
				const { error } = await res.json();
				throw new Error(error);
			}

			setIsSaved(true);
			setTimeout(() => setIsSaved(false), 3000);
			router.refresh();
		} catch (err) {
			console.error(err);
			alert("저장 중 오류가 발생했습니다.");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="space-y-6">
			{/* 기본 기업 정보 */}
			<div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
				<h2 className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-[#1F2937]">
					<Building2 size={16} className="text-[#6B7280]" />
					기본 정보
				</h2>

				<div className="mb-5 flex items-center gap-4">
					<div
						onClick={() => logoInputRef.current?.click()}
						className="flex size-20 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB] transition-colors hover:border-[#3B82F6]"
					>
						{logoUploading ? (
							<Loader2 size={20} className="animate-spin text-[#9CA3AF]" />
						) : logoUrl ? (
							<img src={logoUrl} alt="로고" className="size-full object-cover" />
						) : (
							<ImageIcon size={20} className="text-[#9CA3AF]" />
						)}
					</div>
					<div>
						<p className="text-sm font-medium text-[#374151]">회사 로고</p>
						<p className="text-xs text-[#9CA3AF]">PNG, JPG, WEBP · 최대 5MB</p>
						<button
							onClick={() => logoInputRef.current?.click()}
							className="mt-1 text-xs text-[#3B82F6] hover:underline"
						>
							로고 업로드
						</button>
					</div>
					<input
						ref={logoInputRef}
						type="file"
						accept="image/*"
						className="hidden"
						onChange={handleLogoUpload}
					/>
				</div>

				<div className="grid grid-cols-2 gap-4 text-sm">
					{[
						{ label: "기업명", value: data.company.companyName },
						{ label: "대표자", value: data.company.representative },
						{ label: "업태", value: data.company.businessType },
						{ label: "종목", value: data.company.businessItem },
						{ label: "사업자등록번호", value: data.company.businessNumber },
						{ label: "주소", value: data.company.address },
					].map((item) => (
						<div key={item.label}>
							<p className="text-[#9CA3AF]">{item.label}</p>
							<p className="mt-0.5 font-medium text-[#374151]">{item.value || "-"}</p>
						</div>
					))}
				</div>
			</div>

			{/* 회사 소개 */}
			<div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
				<h2 className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-[#1F2937]">
					<FileText size={16} className="text-[#6B7280]" />
					회사 소개
				</h2>
				<textarea
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="바이어에게 보여질 회사 소개를 입력해주세요"
					rows={4}
					className="w-full resize-none rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
				/>

				<div className="mt-4">
					<label className="mb-1.5 block text-xs font-medium text-[#374151]">취급 카테고리</label>
					<div className="grid grid-cols-4 gap-2">
						{CATEGORY_OPTIONS.map((cat) => (
							<button
								key={cat}
								type="button"
								onClick={() => handleToggleCategory(cat)}
								className={cn(
									"rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
									categories.includes(cat)
										? "border-[#3B82F6] bg-[#EFF6FF] text-[#3B82F6]"
										: "border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50",
								)}
							>
								{CATEGORY_LABELS[cat]}
							</button>
						))}
					</div>
				</div>

				<div className="mt-4 grid grid-cols-2 gap-4">
					<div>
						<label className="mb-1.5 block text-xs font-medium text-[#374151]">설립 연도</label>
						<input
							type="number"
							value={establishedYear}
							onChange={(e) => setEstablishedYear(e.target.value)}
							placeholder="예: 2010"
							className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
						/>
					</div>
					<div>
						<label className="mb-1.5 block text-xs font-medium text-[#374151]">직원 수</label>
						<select
							value={employeeCount}
							onChange={(e) => setEmployeeCount(e.target.value)}
							className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
						>
							<option value="">선택</option>
							{EMPLOYEE_COUNT_OPTIONS.map((opt) => (
								<option key={opt} value={opt}>{opt}</option>
							))}
						</select>
					</div>
				</div>
				<div className="mt-4">
					<label className="mb-1.5 block text-xs font-medium text-[#374151]">홈페이지</label>
					<div className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-4 py-2.5">
						<Globe size={14} className="shrink-0 text-[#9CA3AF]" />
						<input
							type="url"
							value={websiteUrl}
							onChange={(e) => setWebsiteUrl(e.target.value)}
							placeholder="https://example.com"
							className="flex-1 text-sm focus:outline-none"
						/>
					</div>
				</div>
			</div>

			{/* 인증/수상 이력 */}
			<div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
				<h2 className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-[#1F2937]">
					<Award size={16} className="text-[#6B7280]" />
					인증 / 수상 이력
				</h2>
				<div className="mb-3 flex gap-2">
					<input
						type="text"
						value={certInput}
						onChange={(e) => setCertInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								handleAddCert();
							}
						}}
						placeholder="예: ISO 9001, 이노비즈"
						className="flex-1 rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
					/>
					<button
						type="button"
						onClick={handleAddCert}
						className="rounded-lg bg-[#3B82F6] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2563EB]"
					>
						추가
					</button>
				</div>
				<div className="flex flex-wrap gap-2">
					{certifications.map((cert) => (
						<span
							key={cert}
							className="flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-medium text-[#3B82F6]"
						>
							{cert}
							<button onClick={() => handleRemoveCert(cert)}>
								<X size={12} />
							</button>
						</span>
					))}
				</div>
			</div>

			{/* 주요 제품/서비스 */}
			<div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-[15px] font-semibold text-[#1F2937]">주요 제품 / 서비스</h2>
					<button
						onClick={handleAddProduct}
						className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#374151] hover:bg-gray-50"
					>
						<Plus size={13} />
						제품 추가
					</button>
				</div>
				<div className="space-y-4">
					{products.map((product) => (
						<div key={product.id} className="rounded-xl border border-[#F3F4F6] bg-[#F9FAFB] p-4">
							<div className="mb-3 flex items-center justify-between">
								<input
									type="text"
									value={product.name}
									onChange={(e) => handleProductChange(product.id, "name", e.target.value)}
									placeholder="제품명"
									className="flex-1 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
								/>
								<button
									onClick={() => handleRemoveProduct(product.id)}
									className="ml-2 text-[#9CA3AF] hover:text-[#DC2626]"
								>
									<X size={16} />
								</button>
							</div>
							<input
								type="text"
								value={product.description ?? ""}
								onChange={(e) => handleProductChange(product.id, "description", e.target.value)}
								placeholder="제품 설명"
								className="mb-2 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
							/>
							<input
								type="text"
								value={product.priceRange ?? ""}
								onChange={(e) => handleProductChange(product.id, "priceRange", e.target.value)}
								placeholder="가격대 (예: 100만원~500만원)"
								className="mb-3 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
							/>

							<div className="flex flex-wrap gap-2">
								{product.imageUrls.map((url) => (
									<div key={url} className="group relative size-16 overflow-hidden rounded-lg">
										<img src={url} alt="" className="size-full object-cover" />
										<button
											onClick={() => handleRemoveProductImage(product.id, url)}
											className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
										>
											<X size={14} className="text-white" />
										</button>
									</div>
								))}
								<label className="flex size-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-[#E5E7EB] bg-white hover:border-[#3B82F6]">
									<Plus size={16} className="text-[#9CA3AF]" />
									<input
										type="file"
										accept="image/*"
										className="hidden"
										onChange={(e) => handleProductImageUpload(product.id, e)}
									/>
								</label>
							</div>
						</div>
					))}
					{products.length === 0 && (
						<p className="text-center text-sm text-[#9CA3AF]">제품을 추가해주세요</p>
					)}
				</div>
			</div>

			{/* 저장 버튼 */}
			<div className="space-y-3">
				{isSaved && (
					<div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm font-medium text-[#16A34A]">
						✓ 프로필이 저장되었습니다.
					</div>
				)}
				<button
					onClick={handleSubmit}
					disabled={isLoading}
					className={cn(
						"w-full rounded-xl py-3.5 text-[15px] font-semibold text-white transition-colors",
						"bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-60",
					)}
				>
					{isLoading ? "저장 중..." : "프로필 저장"}
				</button>
			</div>
		</div>
	);
}