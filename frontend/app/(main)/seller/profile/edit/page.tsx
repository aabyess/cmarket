import { notFound } from "next/navigation";
import { getSellerProfileData } from "@/features/sellerProfile/apis";
import { ProfileEditForm } from "@/features/sellerProfile/components/ProfileEditForm";

export default async function SellerProfileEditPage() {
	const data = await getSellerProfileData();
	if (!data) notFound();

	return (
		<div className="px-8 py-6 xl:px-12">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-[#1F2937]">기업 프로필</h1>
				<p className="mt-1 text-sm text-[#6B7280]">
					바이어에게 보여질 기업 정보를 입력해주세요
				</p>
			</div>
			<ProfileEditForm data={data} />
		</div>
	);
}