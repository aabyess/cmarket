"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X, ImageIcon, Loader2, Globe } from "lucide-react";
import { uploadImage } from "@/features/sellerProfile/utils";
import { getBuyerProfileData } from "@/features/buyerProfile/apis";
import { updateBuyerProfile } from "@/features/buyerProfile/mutations";
import { cn } from "@/utils/cn";

const EMPLOYEE_COUNT_OPTIONS = ["1-10명", "11-50명", "51-100명", "101-300명", "301-500명", "500명 이상"];

type ProfileEditModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

export function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps): React.ReactNode {
	const logoInputRef = useRef<HTMLInputElement>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [logoUploading, setLogoUploading] = useState(false);

	const [companyName, setCompanyName] = useState("");
	const [logoUrl, setLogoUrl] = useState("");
	const [description, setDescription] = useState("");
	const [establishedYear, setEstablishedYear] = useState("");
	const [employeeCount, setEmployeeCount] = useState("");
	const [websiteUrl, setWebsiteUrl] = useState("");
	const [certifications, setCertifications] = useState<string[]>([]);
	const [certInput, setCertInput] = useState("");

	useEffect(() => {
		if (!isOpen) return;
		setIsLoading(true);
		getBuyerProfileData().then((data) => {
			if (data) {
				setCompanyName(data.company.companyName);
				setLogoUrl(data.profile?.logoUrl ?? "");
				setDescription(data.profile?.description ?? "");
				setEstablishedYear(data.profile?.establishedYear?.toString() ?? "");
				setEmployeeCount(data.profile?.employeeCount ?? "");
				setWebsiteUrl(data.profile?.websiteUrl ?? "");
				setCertifications(data.profile?.certifications ?? []);
			}
			setIsLoading(false);
		});
	}, [isOpen]);

	async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
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

	function handleAddCert(): void {
		const val = certInput.trim();
		setCertInput("");
		if (!val || certifications.includes(val)) return;
		setCertifications((prev) => [...prev, val]);
	}

	function handleRemoveCert(cert: string): void {
		setCertifications(certifications.filter((c) => c !== cert));
	}

	async function handleSave(): Promise<void> {
		setIsSaving(true);
		try {
			await updateBuyerProfile({
				logoUrl,
				description,
				establishedYear: establishedYear ? parseInt(establishedYear, 10) : null,
				employeeCount,
				websiteUrl,
				certifications,
			});
			onClose();
		} catch (err) {
			console.error(err);
			alert("저장 중 오류가 발생했습니다.");
		} finally {
			setIsSaving(false);
		}
	}

	if (!isOpen) return null;

	return (
		<Dialog open={isOpen} onClose={onClose} className="relative z-50">
			<div className="fixed inset-0 bg-black/20" aria-hidden="true" />

			<div className="fixed inset-0 flex items-center justify-center p-4">
				<DialogPanel className="w-full max-w-md overflow-hidden rounded-3xl border border-white/40 bg-white/70 shadow-xl backdrop-blur-2xl backdrop-saturate-150">
					<div className="flex items-center justify-between border-b border-[#F3F4F6] px-5 py-4">
						<DialogTitle className="text-[17px] font-semibold text-[#1F2937]">
							기업 프로필
						</DialogTitle>
						<button
							onClick={onClose}
							className="flex size-8 items-center justify-center rounded-full text-[#9CA3AF] transition-colors hover:bg-imsg-surface"
						>
							<X size={16} />
						</button>
					</div>

					{isLoading ? (
						<div className="flex items-center justify-center py-16">
							<Loader2 size={20} className="animate-spin text-[#9CA3AF]" />
						</div>
					) : (
						<div className="max-h-[calc(85vh-64px)] overflow-y-auto p-5">
							<div className="mb-5 flex items-center gap-4">
								<div
									onClick={() => logoInputRef.current?.click()}
									className="flex size-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB] transition-colors hover:border-imsg-blue"
								>
									{logoUploading ? (
										<Loader2 size={18} className="animate-spin text-[#9CA3AF]" />
									) : logoUrl ? (
										<img src={logoUrl} alt="로고" className="size-full object-cover" />
									) : (
										<ImageIcon size={18} className="text-[#9CA3AF]" />
									)}
								</div>
								<div className="min-w-0">
									<p className="truncate text-[15px] font-semibold text-[#1F2937]">
										{companyName}
									</p>
									<button
										onClick={() => logoInputRef.current?.click()}
										className="text-[13px] text-imsg-blue hover:underline"
									>
										로고 변경
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

							<label className="mb-1.5 block text-[12px] font-medium text-[#374151]">회사 소개</label>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="공급기업에게 보여질 회사 소개를 입력해주세요"
								rows={3}
								className="mb-4 w-full resize-none rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-imsg-blue"
							/>

							<div className="mb-4 grid grid-cols-2 gap-3">
								<div>
									<label className="mb-1.5 block text-[12px] font-medium text-[#374151]">
										설립 연도
									</label>
									<input
										type="number"
										value={establishedYear}
										onChange={(e) => setEstablishedYear(e.target.value)}
										placeholder="예: 2010"
										className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-imsg-blue"
									/>
								</div>
								<div>
									<label className="mb-1.5 block text-[12px] font-medium text-[#374151]">
										직원 수
									</label>
									<select
										value={employeeCount}
										onChange={(e) => setEmployeeCount(e.target.value)}
										className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-imsg-blue"
									>
										<option value="">선택</option>
										{EMPLOYEE_COUNT_OPTIONS.map((opt) => (
											<option key={opt} value={opt}>
												{opt}
											</option>
										))}
									</select>
								</div>
							</div>

							<label className="mb-1.5 block text-[12px] font-medium text-[#374151]">홈페이지</label>
							<div className="mb-4 flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5">
								<Globe size={13} className="shrink-0 text-[#9CA3AF]" />
								<input
									type="url"
									value={websiteUrl}
									onChange={(e) => setWebsiteUrl(e.target.value)}
									placeholder="https://example.com"
									className="flex-1 text-[13px] outline-none"
								/>
							</div>

							<label className="mb-1.5 block text-[12px] font-medium text-[#374151]">
								인증 / 수상 이력
							</label>
							<div className="mb-2 flex gap-1.5">
								<input
									value={certInput}
									onChange={(e) => setCertInput(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.nativeEvent.isComposing) {
											e.preventDefault();
											handleAddCert();
										}
									}}
									placeholder="예: ISO 9001"
									className="flex-1 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-imsg-blue"
								/>
								<button
									onClick={handleAddCert}
									className="rounded-xl bg-imsg-blue px-3.5 py-2.5 text-[13px] font-medium text-white hover:bg-blue-600"
								>
									추가
								</button>
							</div>
							<div className="mb-5 flex flex-wrap gap-1.5">
								{certifications.map((cert) => (
									<span
										key={cert}
										className="flex items-center gap-1 rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[12px] font-medium text-imsg-blue"
									>
										{cert}
										<button onClick={() => handleRemoveCert(cert)}>
											<X size={11} />
										</button>
									</span>
								))}
							</div>

							<button
								onClick={handleSave}
								disabled={isSaving}
								className={cn(
									"w-full rounded-xl py-3 text-[14px] font-semibold text-white transition-colors",
									"bg-imsg-blue hover:bg-blue-600 disabled:opacity-60",
								)}
							>
								{isSaving ? "저장 중..." : "저장"}
							</button>
						</div>
					)}
				</DialogPanel>
			</div>
		</Dialog>
	);
}