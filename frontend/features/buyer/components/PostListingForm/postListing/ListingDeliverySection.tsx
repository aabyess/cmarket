"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import SectionWrapper from "@/features/buyer/components/PostListingForm/postListing/SectionWrapper";
import ListingLocationPickerModal from "@/features/buyer/components/PostListingForm/postListing/ListingLocationPickerModal";
import { cn } from "@/utils/cn";
import { getProvinces, getRegencies, type WilayahOption } from "@/libs/wilayah";
import type { ListingFormData } from "@/features/buyer/types";
import { getDeliveryMethodLabels, DELIVERY_METHOD_OPTIONS } from "@/features/buyer/constants";

type ListingDeliverySectionProps = {
	form: ListingFormData;
	onChange: (patch: Partial<ListingFormData>) => void;
};

export default function ListingDeliverySection({ form, onChange }: ListingDeliverySectionProps) {
	const t = useTranslations("ListingDeliverySection");
	const deliveryMethodLabels = getDeliveryMethodLabels(useTranslations("DeliveryMethod"));
	const [provinces, setProvinces] = useState<WilayahOption[]>([]);
	const [regencies, setRegencies] = useState<WilayahOption[]>([]);
	const [isLoadingRegencies, setIsLoadingRegencies] = useState(false);
	const [isMapOpen, setIsMapOpen] = useState(false);

	useEffect(() => {
		getProvinces()
			.then(setProvinces)
			.catch((err) => console.error(err));
	}, []);

	useEffect(() => {
		const selectedProvince = provinces.find((p) => p.name === form.deliveryProvinsi);
		if (!selectedProvince) {
			setRegencies([]);
			return;
		}

		setIsLoadingRegencies(true);
		getRegencies(selectedProvince.code)
			.then(setRegencies)
			.catch((err) => console.error(err))
			.finally(() => setIsLoadingRegencies(false));
	}, [form.deliveryProvinsi, provinces]);

	function handleProvinceChange(name: string): void {
		onChange({ deliveryProvinsi: name, deliveryCity: "", deliveryLat: null, deliveryLng: null });
	}

	function handleCityChange(name: string): void {
		onChange({ deliveryCity: name, deliveryLat: null, deliveryLng: null });
	}

	return (
		<SectionWrapper
			title={t("title")}
			subtitle={t("subtitle")}
		>
			<div className="space-y-4">
				<div>
					<label className="mb-2 block text-sm font-medium text-[#374151]">{t("deliveryMethodLabel")}</label>
					<div className="flex flex-wrap gap-1.5">
						{DELIVERY_METHOD_OPTIONS.map((method) => (
							<button
								key={method}
								type="button"
								onClick={() => onChange({ deliveryMethod: method })}
								className={cn(
									"rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
									form.deliveryMethod === method
										? "border-imsg-blue bg-imsg-blue text-white"
										: "border-[#E2E8F0] bg-white text-[#374151] hover:bg-[#F9FAFB]",
								)}
							>
								{deliveryMethodLabels[method]}
							</button>
						))}
					</div>
				</div>

				<div className="space-y-3">
					<div className="grid grid-cols-2 gap-3">
						<select
							value={form.deliveryProvinsi}
							onChange={(e) => handleProvinceChange(e.target.value)}
							className="rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
						>
							<option value="">{t("provinceSelect")}</option>
							{provinces.map((province) => (
								<option key={province.code} value={province.name}>
									{province.name}
								</option>
							))}
						</select>
						<select
							value={form.deliveryCity}
							onChange={(e) => handleCityChange(e.target.value)}
							disabled={!form.deliveryProvinsi || isLoadingRegencies}
							className="rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF]"
						>
							<option value="">
								{isLoadingRegencies ? t("loading") : t("citySelect")}
							</option>
							{regencies.map((regency) => (
								<option key={regency.code} value={regency.name}>
									{regency.name}
								</option>
							))}
						</select>
					</div>

					<div className="grid grid-cols-[1fr_1.6fr] gap-3">
						<button
							type="button"
							onClick={() => setIsMapOpen(true)}
							className="flex items-center justify-center gap-1.5 rounded-lg border border-imsg-blue px-4 py-3 text-sm font-medium text-imsg-blue transition-colors hover:bg-[#EFF6FF]"
						>
							<MapPin size={15} />
							{form.deliveryLat ? t("recheckLocation") : t("checkLocation")}
						</button>
						<input
							type="text"
							value={form.deliveryAddress}
							onChange={(e) => onChange({ deliveryAddress: e.target.value })}
							placeholder={t("addressPlaceholder")}
							className="rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
						/>
					</div>

					<input
						type="text"
						value={form.deliveryAddressDetail}
						onChange={(e) => onChange({ deliveryAddressDetail: e.target.value })}
						placeholder={t("addressDetailPlaceholder")}
						className="w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
					/>
				</div>
			</div>

			{isMapOpen && (
				<ListingLocationPickerModal
					isOpen={isMapOpen}
					onClose={() => setIsMapOpen(false)}
					initialLat={form.deliveryLat}
					initialLng={form.deliveryLng}
					initialSearchQuery={[form.deliveryProvinsi, form.deliveryCity].filter(Boolean).join(", ")}
					onConfirm={(lat, lng, address) =>
						onChange({
							deliveryLat: lat,
							deliveryLng: lng,
							deliveryAddress: address || form.deliveryAddress,
						})
					}
				/>
			)}
		</SectionWrapper>
	);
}