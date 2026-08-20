"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/libs/supabase";
import { cn } from "@/utils/cn";
import { LanguageSwitcher } from "@/components/commons/LanguageSwitcher";

export default function ForgotPasswordPage() {
	const t = useTranslations("ForgotPassword");
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	async function handleSubmit() {
		if (!email.trim()) return;
		setIsLoading(true);

		const supabase = createClient();
		const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
			redirectTo: `${window.location.origin}/reset-password`,
		});

		// 이메일 존재 여부가 드러나지 않도록 성공/실패와 무관하게 같은 안내를 보여준다.
		if (error) console.error("resetPasswordForEmail error:", error);

		setIsLoading(false);
		setIsSubmitted(true);
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Enter") handleSubmit();
	}

	return (
		<div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
			<div className="fixed right-4 top-4">
				<LanguageSwitcher />
			</div>

			<div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-10">
				<div className="flex justify-center mb-4">
					<Image src="/images/MitraPay.png" alt="MitraPay 로고" width={140} height={140} priority />
				</div>

				{isSubmitted ? (
					<>
						<h1 className="text-2xl font-bold text-center text-[#1F2937] mb-3">{t("sentTitle")}</h1>
						<p className="text-center text-sm text-[#6B7280] mb-8">{t("sentDescription")}</p>
						<button
							onClick={() => router.push("/login")}
							className="w-full py-3 rounded-lg font-semibold text-sm bg-imsg-blue text-white hover:bg-[#2563EB] transition-all"
						>
							{t("backToLogin")}
						</button>
					</>
				) : (
					<>
						<h1 className="text-2xl font-bold text-center text-[#1F2937] mb-2">{t("title")}</h1>
						<p className="text-center text-sm text-[#6B7280] mb-6">{t("description")}</p>

						<div className="space-y-5">
							<div className="space-y-1.5">
								<label className="text-sm font-medium text-[#374151]">{t("emailLabel")}</label>
								<input
									type="email"
									autoComplete="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									onKeyDown={handleKeyDown}
									placeholder={t("emailPlaceholder")}
									className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-imsg-blue focus:ring-1 focus:ring-imsg-blue transition-colors"
								/>
							</div>

							<button
								onClick={handleSubmit}
								disabled={isLoading || !email.trim()}
								className={cn(
									"w-full py-3 rounded-lg font-semibold text-sm transition-all",
									"bg-imsg-blue text-white hover:bg-[#2563EB]",
									"disabled:opacity-50 disabled:cursor-not-allowed",
								)}
							>
								{isLoading ? t("submitting") : t("submit")}
							</button>

							<button
								onClick={() => router.push("/login")}
								className="w-full py-3 border border-[#E5E7EB] rounded-lg font-medium text-sm text-[#374151] hover:bg-gray-50 transition-colors"
							>
								{t("backToLogin")}
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
