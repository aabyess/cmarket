"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/libs/supabase";
import { cn } from "@/utils/cn";
import { LanguageSwitcher } from "@/components/commons/LanguageSwitcher";

type Status = "checking" | "ready" | "expired" | "success";

export default function ResetPasswordPage() {
	const t = useTranslations("ResetPassword");
	const router = useRouter();
	const [status, setStatus] = useState<Status>("checking");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const supabase = createClient();

		// 메일 링크로 들어오면 URL의 recovery 토큰을 인식해 이 이벤트가 발생한다.
		const { data: listener } = supabase.auth.onAuthStateChange((event) => {
			if (event === "PASSWORD_RECOVERY") setStatus("ready");
		});

		// 이벤트가 이미 처리된 뒤 마운트됐을 수 있으니 현재 세션도 확인한다.
		supabase.auth.getSession().then(({ data: { session } }) => {
			setStatus((prev) => (prev === "checking" ? (session ? "ready" : "expired") : prev));
		});

		return () => listener.subscription.unsubscribe();
	}, []);

	async function handleSubmit() {
		setError(null);
		if (password.length < 8) {
			setError(t("errorTooShort"));
			return;
		}
		if (password !== confirmPassword) {
			setError(t("errorMismatch"));
			return;
		}

		setIsLoading(true);
		const supabase = createClient();
		const { error: updateError } = await supabase.auth.updateUser({ password });
		setIsLoading(false);

		if (updateError) {
			setError(t("errorGeneric"));
			return;
		}

		setStatus("success");
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

				{status === "checking" && (
					<p className="text-center text-sm text-[#6B7280]">{t("checking")}</p>
				)}

				{status === "expired" && (
					<>
						<h1 className="text-2xl font-bold text-center text-[#1F2937] mb-3">
							{t("expiredTitle")}
						</h1>
						<p className="text-center text-sm text-[#6B7280] mb-8">{t("expiredDescription")}</p>
						<button
							onClick={() => router.push("/forgot-password")}
							className="w-full py-3 rounded-lg font-semibold text-sm bg-imsg-blue text-white hover:bg-[#2563EB] transition-all"
						>
							{t("requestNewLink")}
						</button>
					</>
				)}

				{status === "success" && (
					<>
						<h1 className="text-2xl font-bold text-center text-[#1F2937] mb-3">
							{t("successTitle")}
						</h1>
						<p className="text-center text-sm text-[#6B7280] mb-8">{t("successDescription")}</p>
						<button
							onClick={() => router.push("/login")}
							className="w-full py-3 rounded-lg font-semibold text-sm bg-imsg-blue text-white hover:bg-[#2563EB] transition-all"
						>
							{t("goToLogin")}
						</button>
					</>
				)}

				{status === "ready" && (
					<>
						<h1 className="text-2xl font-bold text-center text-[#1F2937] mb-2">{t("title")}</h1>
						<p className="text-center text-sm text-[#6B7280] mb-6">{t("description")}</p>

						<div className="space-y-5">
							<div className="space-y-1.5">
								<label className="text-sm font-medium text-[#374151]">
									{t("newPasswordLabel")}
								</label>
								<div className="relative">
									<input
										type={showPassword ? "text" : "password"}
										autoComplete="new-password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										onKeyDown={handleKeyDown}
										placeholder={t("newPasswordPlaceholder")}
										className="w-full px-4 py-3 pr-11 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-imsg-blue focus:ring-1 focus:ring-imsg-blue transition-colors"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] transition-colors"
									>
										{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
									</button>
								</div>
							</div>

							<div className="space-y-1.5">
								<label className="text-sm font-medium text-[#374151]">
									{t("confirmPasswordLabel")}
								</label>
								<input
									type={showPassword ? "text" : "password"}
									autoComplete="new-password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									onKeyDown={handleKeyDown}
									placeholder={t("confirmPasswordPlaceholder")}
									className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-imsg-blue focus:ring-1 focus:ring-imsg-blue transition-colors"
								/>
							</div>

							{error && <p className="text-sm text-red-500">{error}</p>}

							<button
								onClick={handleSubmit}
								disabled={isLoading || !password || !confirmPassword}
								className={cn(
									"w-full py-3 rounded-lg font-semibold text-sm transition-all",
									"bg-imsg-blue text-white hover:bg-[#2563EB]",
									"disabled:opacity-50 disabled:cursor-not-allowed",
								)}
							>
								{isLoading ? t("submitting") : t("submit")}
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
