"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import checkmarkAnimation from "@/public/animations/checkmark.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

type SignupCompleteProps = {
	role: "buyer" | "seller";
};

export function SignupComplete({ role }: SignupCompleteProps) {
	const router = useRouter();
	const [countdown, setCountdown] = useState(3);
	const homePath = role === "seller" ? "/seller/dashboard" : "/buyer/dashboard";

	useEffect(() => {
		const interval = setInterval(() => {
			setCountdown((prev) => (prev <= 0 ? 0 : prev - 1));
		}, 1000);
	
		return () => clearInterval(interval);
	}, []);
	
	useEffect(() => {
		if (countdown === 0) {
			router.push("/login");
		}
	}, [countdown, router]);

	return (
		<main
			className="flex min-h-screen flex-col items-center justify-center gap-6"
			style={{ backgroundColor: "#F0F5FF" }}
		>
			<div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 flex flex-col items-center gap-6 w-full max-w-md">
				<div className="w-32 h-32">
					<Lottie animationData={checkmarkAnimation} loop={false} autoplay />
				</div>

				<div className="text-center space-y-2">
					<h1 className="text-2xl font-bold text-[#1F2937]">회원가입 완료!</h1>
					<p className="text-sm text-[#6B7280]">
						MitraPay에 오신 것을 환영합니다.
					</p>
				</div>

				<p className="text-sm text-[#9CA3AF]">
					{countdown}초 후 대시보드로 이동합니다.
				</p>


				<button
					onClick={() => router.push(homePath)}
					className="w-full h-12 rounded-xl font-semibold text-base bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors"
				>
					바로 시작하기
				</button>
			</div>
		</main>
	);
}