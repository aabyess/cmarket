// features/chat/components/ChatInfoCard/ChatInfoCardMapModal.tsx
"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useTranslations } from "next-intl";
import { ExternalLink, X } from "lucide-react";
import { getModalPanelTransition } from "@/utils/modalMotion";

type ChatInfoCardMapModalProps = {
	isOpen: boolean;
	onClose: () => void;
	lat: number;
	lng: number;
	address: string;
};

export function ChatInfoCardMapModal({
	isOpen,
	onClose,
	lat,
	lng,
	address,
}: ChatInfoCardMapModalProps): React.ReactNode {
	const t = useTranslations("ChatInfoCard");
	const prefersReducedMotion = useReducedMotion();
	// 읽기 전용 지도라 검색 자동완성이 필요 없어 ListingLocationPickerModal과 달리
	// libraries(places)를 요청하지 않는다.
	const { isLoaded, loadError } = useJsApiLoader({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
	});

	const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

	return (
		<AnimatePresence>
			{isOpen && (
				<Dialog static open={isOpen} onClose={onClose} className="relative z-50">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="fixed inset-0 bg-black/40"
						aria-hidden="true"
					/>

					<div className="fixed inset-0 flex items-center justify-center p-4">
						<DialogPanel className="w-full max-w-md">
							<motion.div
								initial={{ opacity: 0, scale: 0.95, y: 8 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: 8 }}
								transition={getModalPanelTransition(prefersReducedMotion)}
								className="overflow-hidden rounded-2xl bg-white shadow-xl">
								<div className="flex items-center justify-between px-5 pt-5">
									<DialogTitle className="text-sm font-semibold text-[#1F2937]">
										{t("mapModalTitle")}
									</DialogTitle>
									<button
										onClick={onClose}
										className="text-[#9CA3AF] transition-colors hover:text-[#374151]">
										<X size={18} />
									</button>
								</div>

								<div className="p-5">
									{loadError || !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
										<div className="flex h-56 flex-col items-center justify-center gap-2 rounded-lg bg-[#F9FAFB] text-center">
											<p className="px-6 text-xs text-[#9CA3AF]">{t("mapUnavailable")}</p>
										</div>
									) : !isLoaded ? (
										<div className="flex h-56 items-center justify-center text-sm text-[#9CA3AF]">
											{t("mapLoading")}
										</div>
									) : (
										<GoogleMap
											mapContainerClassName="h-56 w-full rounded-lg"
											center={{ lat, lng }}
											zoom={15}
											options={{
												disableDefaultUI: true,
												zoomControl: true,
												gestureHandling: "cooperative",
											}}>
											<Marker position={{ lat, lng }} />
										</GoogleMap>
									)}

									<p className="mt-3 text-sm break-words text-[#374151]">{address}</p>

									<a
										href={mapUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-imsg-blue hover:underline">
										{t("openInGoogleMaps")}
										<ExternalLink size={11} />
									</a>
								</div>
							</motion.div>
						</DialogPanel>
					</div>
				</Dialog>
			)}
		</AnimatePresence>
	);
}
