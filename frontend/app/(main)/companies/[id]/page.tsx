import { notFound } from "next/navigation";
import Link from "next/link";
import { Building2, Globe, Users, Calendar, Award, Package } from "lucide-react";
import { getPublicCompanyProfile } from "@/features/company/apis";

type CompanyPageProps = {
	params: Promise<{ id: string }>;
};

export default async function CompanyProfilePage({ params }: CompanyPageProps) {
	const { id } = await params;
	const company = await getPublicCompanyProfile(id);
	if (!company) notFound();

	return (
		<div className="px-8 py-6 xl:px-12">
			<div className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-6">
				<div className="flex items-center gap-4">
					{company.logoUrl ? (
						<img
							src={company.logoUrl}
							alt={company.companyName}
							className="size-20 rounded-xl object-cover"
						/>
					) : (
						<div className="flex size-20 items-center justify-center rounded-xl bg-[#F3F4F6]">
							<Building2 size={32} className="text-[#9CA3AF]" />
						</div>
					)}
					<div>
						<h1 className="text-2xl font-bold text-[#1F2937]">{company.companyName}</h1>
						<p className="mt-1 text-sm text-[#6B7280]">
							{[company.businessType, company.businessItem].filter(Boolean).join(" · ")}
						</p>
						<div className="mt-2 flex flex-wrap gap-3 text-xs text-[#9CA3AF]">
							{company.establishedYear && (
								<span className="flex items-center gap-1">
									<Calendar size={12} />
									{company.establishedYear}년 설립
								</span>
							)}
							{company.employeeCount && (
								<span className="flex items-center gap-1">
									<Users size={12} />
									{company.employeeCount}
								</span>
							)}
							{company.websiteUrl && (
								<Link
									href={company.websiteUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-1 text-[#3B82F6] hover:underline"
								>
									<Globe size={12} />
									홈페이지
								</Link>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
				<div className="space-y-6 xl:col-span-2">
					{company.description && (
						<div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
							<h2 className="mb-3 text-sm font-semibold text-[#1F2937]">회사 소개</h2>
							<p className="whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">
								{company.description}
							</p>
						</div>
					)}

					{company.products.length > 0 && (
						<div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
							<h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#1F2937]">
								<Package size={15} className="text-[#6B7280]" />
								주요 제품 / 서비스
							</h2>
							<div className="space-y-4">
								{company.products.map((product) => (
									<div
										key={product.id}
										className="rounded-xl border border-[#F3F4F6] bg-[#F9FAFB] p-4"
									>
										<p className="font-semibold text-[#1F2937]">{product.name}</p>
										{product.description && (
											<p className="mt-1 text-sm text-[#6B7280]">{product.description}</p>
										)}
										{product.priceRange && (
											<p className="mt-1 text-xs text-[#9CA3AF]">{product.priceRange}</p>
										)}
										{product.imageUrls.length > 0 && (
											<div className="mt-3 flex flex-wrap gap-2">
												{product.imageUrls.map((url) => (
													<img
														key={url}
														src={url}
														alt={product.name}
														className="size-20 rounded-lg object-cover"
													/>
												))}
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				<div className="space-y-6">
					<div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
						<h2 className="mb-4 text-sm font-semibold text-[#1F2937]">기업 정보</h2>
						<div className="space-y-3 text-sm">
							{[
								{ label: "대표자", value: company.representative },
								{ label: "소재지", value: company.address },
							].map((item) => (
								<div key={item.label}>
									<p className="text-[#9CA3AF]">{item.label}</p>
									<p className="mt-0.5 font-medium text-[#374151]">{item.value || "-"}</p>
								</div>
							))}
						</div>
					</div>

					{company.certifications.length > 0 && (
						<div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
							<h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1F2937]">
								<Award size={15} className="text-[#6B7280]" />
								인증 / 수상
							</h2>
							<div className="flex flex-wrap gap-2">
								{company.certifications.map((cert) => (
									<span
										key={cert}
										className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-medium text-[#3B82F6]"
									>
										{cert}
									</span>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}