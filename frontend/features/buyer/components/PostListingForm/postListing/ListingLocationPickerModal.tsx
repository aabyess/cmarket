"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { X } from "lucide-react";

const LIBRARIES: "places"[] = ["places"];
const DEFAULT_CENTER = { lat: -6.2088, lng: 106.8456 }; // 자카르타 기본 좌표

type ListingLocationPickerModalProps = {
	isOpen: boolean;
	onClose: () => void;
	initialLat: number | null;
	initialLng: number | null;
	initialSearchQuery?: string;
	onConfirm: (lat: number, lng: number, address: string) => void;
};

export default function ListingLocationPickerModal({
	isOpen,
	onClose,
	initialLat,
	initialLng,
	initialSearchQuery,
	onConfirm,
}: ListingLocationPickerModalProps) {
	const { isLoaded } = useJsApiLoader({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
		libraries: LIBRARIES,
	});

	const [marker, setMarker] = useState({
		lat: initialLat ?? DEFAULT_CENTER.lat,
		lng: initialLng ?? DEFAULT_CENTER.lng,
	});
	const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
	const mapRef = useRef<google.maps.Map | null>(null);

	// 모달이 열릴 때, 이미 지정된 좌표가 없고 지역 검색어가 있으면 그 지역으로 이동
	useEffect(() => {
		if (!isOpen || !isLoaded) return;
		if (initialLat !== null && initialLng !== null) {
			setMarker({ lat: initialLat, lng: initialLng });
			mapRef.current?.panTo({ lat: initialLat, lng: initialLng });
			return;
		}
		if (!initialSearchQuery) return;

		const geocoder = new google.maps.Geocoder();
		geocoder.geocode({ address: initialSearchQuery }, (results, status) => {
			if (status !== "OK" || !results?.[0]?.geometry?.location) return;
			const lat = results[0].geometry.location.lat();
			const lng = results[0].geometry.location.lng();
			setMarker({ lat, lng });
			mapRef.current?.panTo({ lat, lng });
			mapRef.current?.setZoom(12);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, isLoaded]);

	const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
		if (!e.latLng) return;
		setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() });
	}, []);

	function handlePlaceChanged(): void {
		const place = autocompleteRef.current?.getPlace();
		if (!place?.geometry?.location) return;

		const lat = place.geometry.location.lat();
		const lng = place.geometry.location.lng();
		setMarker({ lat, lng });
		mapRef.current?.panTo({ lat, lng });
	}

	async function handleConfirm(): Promise<void> {
		const geocoder = new google.maps.Geocoder();
		geocoder.geocode({ location: marker }, (results) => {
			const address = results?.[0]?.formatted_address ?? "";
			onConfirm(marker.lat, marker.lng, address);
			onClose();
		});
	}

	return (
		<Dialog open={isOpen} onClose={onClose} className="relative z-50">
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />
			<div className="fixed inset-0 flex items-center justify-center p-4">
				<DialogPanel className="w-full max-w-2xl rounded-2xl bg-white p-5">
					<div className="mb-3 flex items-center justify-between">
						<DialogTitle className="text-sm font-semibold text-[#1F2937]">
							배송지 위치 확인
						</DialogTitle>
						<button onClick={onClose} className="text-[#9CA3AF] hover:text-[#374151]">
							<X size={18} />
						</button>
					</div>

					{!isLoaded ? (
						<div className="flex h-96 items-center justify-center text-sm text-[#9CA3AF]">
							지도를 불러오는 중...
						</div>
					) : (
						<>
							<Autocomplete
								onLoad={(ac) => {
									autocompleteRef.current = ac;
								}}
								onPlaceChanged={handlePlaceChanged}
							>
								<input
									type="text"
									placeholder="주소 또는 장소명 검색"
									className="mb-3 w-full rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
								/>
							</Autocomplete>

							<GoogleMap
								mapContainerClassName="h-96 w-full rounded-lg"
								center={marker}
								zoom={14}
								onClick={handleMapClick}
								onLoad={(map) => {
									mapRef.current = map;
								}}
							>
								<Marker
									position={marker}
									draggable
									onDragEnd={(e) => {
										if (!e.latLng) return;
										setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() });
									}}
								/>
							</GoogleMap>

							<p className="mt-2 text-xs text-[#9CA3AF]">
								지도를 클릭하거나 핀을 드래그해서 정확한 위치를 지정해주세요.
							</p>
						</>
					)}

					<div className="mt-4 flex justify-end gap-2">
						<button
							onClick={onClose}
							className="rounded-lg px-4 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F3F4F6]"
						>
							취소
						</button>
						<button
							onClick={handleConfirm}
							disabled={!isLoaded}
							className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-50"
						>
							이 위치로 확정
						</button>
					</div>
				</DialogPanel>
			</div>
		</Dialog>
	);
}