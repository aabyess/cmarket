// features/landing/fonts.ts
import { IBM_Plex_Mono, IBM_Plex_Sans_KR } from "next/font/google";

/** 랜딩 전용 서체 — 무역 서류 무드의 IBM Plex 페어링 (본문/디스플레이 + 문서 라벨용 모노) */
export const landingSans = IBM_Plex_Sans_KR({
	weight: ["400", "500", "600", "700"],
	subsets: ["latin"],
	variable: "--font-landing-sans",
	display: "swap",
});

export const landingMono = IBM_Plex_Mono({
	weight: ["400", "500", "600"],
	subsets: ["latin"],
	variable: "--font-landing-mono",
	display: "swap",
});
