"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import dynamic from "next/dynamic";
import { CheckCircle2, FileSearch, PlusCircle, ShieldCheck } from "lucide-react";
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
	const homePath = role === "seller" ? "/seller/dashboard" : "/buyer/dashboard";
	const settingsPath = role === "seller" ? "/seller/settings" : "/buyer/settings";
	const roleActionPath = role === "seller" ? "/seller/listing-browse" : "/buyer/post-listing";
	const RoleActionIcon = role === "seller" ? FileSearch : PlusCircle;

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

				<div className="flex w-full flex-col gap-2.5">
					<button
						onClick={() => router.push(roleActionPath)}
						className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-imsg-blue text-base font-semibold text-white transition-colors hover:bg-[#2563EB]"
					>
						<RoleActionIcon size={18} />
						{role === "seller" ? t("roleActionSeller") : t("roleActionBuyer")}
					</button>

					<button
						onClick={() => router.push(`${settingsPath}#verification`)}
						className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] text-base font-semibold text-[#374151] transition-colors hover:bg-imsg-surface"
					>
						<ShieldCheck size={18} />
						{t("verificationAction")}
					</button>

					<button
						onClick={() => router.push(homePath)}
						className="mt-1 text-sm font-medium text-[#9CA3AF] transition-colors hover:text-[#6B7280]"
					>
						{t("start")}
					</button>
				</div>
			</div>
		</main>
	);
}