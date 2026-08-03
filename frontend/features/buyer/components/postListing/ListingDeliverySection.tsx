"use client";

import SectionWrapper from "@/features/buyer/components/postListing/SectionWrapper";
import type { ListingFormData } from "@/features/buyer/types";

const PROVINSI_LIST = [
	"Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau",
	"Jambi", "Bengkulu", "Sumatera Selatan", "Kepulauan Bangka Belitung",
	"Lampung", "DKI Jakarta", "Jawa Barat", "Banten", "Jawa Tengah",
	"DI Yogyakarta", "Jawa Timur", "Bali", "Nusa Tenggara Barat",
	"Nusa Tenggara Timur", "Kalimantan Barat", "Kalimantan Tengah",
	"Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
	"Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat",
	"Sulawesi Selatan", "Sulawesi Tenggara", "Maluku", "Maluku Utara",
	"Papua Barat", "Papua",
];

type ListingDeliverySectionProps = {
	form: ListingFormData;
	onChange: (patch: Partial<ListingFormData>) => void;
};

export default function ListingDeliverySection({ form, onChange }: ListingDeliverySectionProps) {
	return (
		<SectionWrapper title="배송지" subtitle="물품을 받을 주소를 입력해주세요">
			<div className="space-y-3">
				<div className="grid grid-cols-2 gap-3">
					<select
						value={form.deliveryProvinsi}
						onChange={(e) => onChange({ deliveryProvinsi: e.target.value })}
						className="rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
					>
						<option value="">주(Provinsi) 선택</option>
						{PROVINSI_LIST.map((provinsi) => (
							<option key={provinsi} value={provinsi}>
								{provinsi}
							</option>
						))}
					</select>
					<input
						type="text"
						value={form.deliveryCity}
						onChange={(e) => onChange({ deliveryCity: e.target.value })}
						placeholder="시/군 (Kota/Kabupaten)"
						className="rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
					/>
				</div>
				<input
					type="text"
					value={form.deliveryAddress}
					onChange={(e) => onChange({ deliveryAddress: e.target.value })}
					placeholder="상세 주소"
					className="w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
				/>
			</div>
		</SectionWrapper>
	);
}