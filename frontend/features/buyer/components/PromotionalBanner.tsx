"use client";

import { X } from "lucide-react";
import { useState } from "react";

export function PromotionalBanner(){
	const [isDismissed, setIsDismissed] = useState(false);

	if (isDismissed) return null;

	return (
		<div className="relative w-full rounded-xl overflow-hidden shadow-md">
			<div className="bg-linear-to-r from-[#1B3A6B] to-[#0D9488] relative">
				<div className="flex items-center justify-between p-8 relative z-10">
					<div className="flex-1 max-w-2xl">
						<p className="text-white/70 text-sm font-medium mb-2">
							🇰🇷 × 🇮🇩 Korea - Indonesia B2B Platform
						</p>
						<h2 className="text-white text-2xl sm:text-3xl font-bold mb-3 leading-tight">
							한국-인도네시아 기업 간 거래를 시작하세요
						</h2>
						<p className="text-white/80 text-sm sm:text-base">
							신뢰할 수 있는 파트너와 함께하는 글로벌 조달 플랫폼
						</p>
					</div>
					<div className="hidden sm:flex flex-1 items-center justify-end relative">
						<div className="absolute inset-0 flex items-center justify-end pr-8 pointer-events-none">
							<div className="absolute w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
							<div className="relative w-40 h-40">
								<svg
									viewBox="0 0 200 200"
									className="w-full h-full opacity-20"
									fill="none"
									stroke="white"
									strokeWidth="1.5">
									<path d="M 100 20 L 180 100 L 100 180 L 20 100 Z" />
									<path d="M 100 50 L 150 100 L 100 150 L 50 100 Z" />
									<circle cx="100" cy="100" r="30" />
									<path d="M 40 40 L 60 40 L 60 60 L 40 60 Z" />
									<path d="M 140 140 L 160 140 L 160 160 L 140 160 Z" />
								</svg>
							</div>
						</div>
					</div>
				</div>
				<button
					onClick={() => setIsDismissed(true)}
					className="absolute top-4 right-4 z-20 p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white">
					<X size={20} />
				</button>
			</div>
		</div>
	);
}