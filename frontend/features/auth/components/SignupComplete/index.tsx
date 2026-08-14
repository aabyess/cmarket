"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import dynamic from "next/dynamic";
import { CheckCircle2 } from "lucide-react";
import checkmarkAnimation from "@/public/animations/checkmark.json";

const Lottie = dynamic(() => import("lottie-react"), {
	ssr: false,
	loading: () => <CheckCircle2 className="size-full text-imsg-blue" />,
});

type SignupCompleteProps = {
	role: "buyer" | "seller";
};

export function SignupComplete({ role }: SignupCompleteProps) {
	const t = useTranslations("SignupComplete");
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
			router.push(homePath);
		}
	}, [countdown, router, homePath]);

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
					<h1 className="text-2xl font-bold text-[#1F2937]">{t("title")}</h1>
					<p className="text-sm text-[#6B7280]">
						{t("welcome")}
					</p>
				</div>

				<p className="text-sm text-[#9CA3AF]">
					{t("countdown", { seconds: countdown })}
				</p>


				<button
					onClick={() => router.push(homePath)}
					className="w-full h-12 rounded-xl font-semibold text-base bg-imsg-blue hover:bg-[#2563EB] text-white transition-colors"
				>
					{t("start")}
				</button>
			</div>
		</main>
	);
}