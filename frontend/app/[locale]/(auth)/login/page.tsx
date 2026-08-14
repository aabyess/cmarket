"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useLogin } from "@/features/auth/mutations";
import { SecurityModal } from "@/features/auth/components/SecurityModal";
import { cn } from "@/utils/cn";
import Image from "next/image";
import { getUserRole } from "@/features/auth/apis";
import { LanguageSwitcher } from "@/components/commons/LanguageSwitcher";

const SAVED_USERNAME_KEY = "saved_username";

export default function LoginPage() {
	const t = useTranslations("Login");
	const router = useRouter();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [saveUsername, setSaveUsername] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { mutateAsync: login } = useLogin();
	const [securityStep, setSecurityStep] = useState<"connecting" | "verifying" | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const saved = localStorage.getItem(SAVED_USERNAME_KEY);
		if (saved) {
			setUsername(saved);
			setSaveUsername(true);
		}
	}, []);

	useEffect(() => {
		if (saveUsername) {
			localStorage.setItem(SAVED_USERNAME_KEY, username);
		} else {
			localStorage.removeItem(SAVED_USERNAME_KEY);
		}
	}, [username, saveUsername]);

	async function handleSubmit() {
		setIsLoading(true);
		setError(null);
		setSecurityStep("connecting");
	
		await new Promise((resolve) => setTimeout(resolve, 1000));
		setSecurityStep("verifying");
	
		try {
			await login({ username, password });
			const role = await getUserRole();
			await new Promise((resolve) => setTimeout(resolve, 800));
			router.push(role === "seller" ? "/seller/dashboard" : "/buyer/dashboard");
		} catch {
			setSecurityStep(null);
			setError(t("errorInvalid"));
		} finally {
			setIsLoading(false);
		}
	}
	
	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Enter") handleSubmit();
	}

	return (
		<div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
			{securityStep && <SecurityModal step={securityStep} />}

			<div className="fixed right-4 top-4">
				<LanguageSwitcher />
			</div>

			<div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-10">
				{/* 로고 */}
				<div className="flex justify-center mb-4">
				<Image
					src="/images/MitraPay.png"
					alt="MitraPay 로고"
					width={140}
					height={140}
					priority
				/>
				</div>

				<h1 className="text-2xl font-bold text-center text-[#1F2937] mb-6">{t("title")}</h1>

				<div className="space-y-5">
					<div className="space-y-1.5">
						<label className="text-sm font-medium text-[#374151]">{t("idLabel")}</label>
						<input
							type="text"
							autoComplete="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={t("idPlaceholder")}
							className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-imsg-blue focus:ring-1 focus:ring-imsg-blue transition-colors"
						/>
					</div>

					<div className="space-y-1.5">
						<label className="text-sm font-medium text-[#374151]">{t("passwordLabel")}</label>
						<div className="relative">
							<input
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder={t("passwordPlaceholder")}
								className="w-full px-4 py-3 pr-11 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-imsg-blue focus:ring-1 focus:ring-imsg-blue transition-colors"
							/>
							<button
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] transition-colors"
							>
								{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
							</button>
						</div>
					</div>

					<button
						type="button"
						onClick={() => setSaveUsername((prev) => !prev)}
						className="flex items-center gap-2"
					>
						<span
							className={cn(
								"flex h-4 w-4 items-center justify-center rounded border transition-colors",
								saveUsername ? "bg-[#3B82F6] border-[#3B82F6]" : "border-[#D1D5DB] bg-white",
							)}
						>
							{saveUsername && (
								<svg width="8" height="6" viewBox="0 0 10 8" fill="none">
									<path
										d="M1 4L3.5 6.5L9 1"
										stroke="white"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							)}
						</span>
						<span className="text-sm text-[#374151]">{t("rememberUsername")}</span>
					</button>

					{error && <p className="text-sm text-red-500">{error}</p>}

					<button
						onClick={handleSubmit}
						disabled={isLoading || !username || !password}
						className={cn(
							"w-full py-3 rounded-lg font-semibold text-sm transition-all",
							"bg-imsg-blue text-white hover:bg-[#2563EB]",
							"disabled:opacity-50 disabled:cursor-not-allowed",
						)}
					>
						{isLoading ? t("submitting") : t("submit")}
					</button>

					<div className="flex items-center gap-3 py-1">
						<div className="flex-1 h-px bg-[#E5E7EB]"></div>
						<span className="text-xs text-[#9CA3AF]">{t("noAccount")}</span>
						<div className="flex-1 h-px bg-[#E5E7EB]"></div>
					</div>

					<button
						onClick={() => router.push("/signup")}
						className="w-full py-3 border border-[#E5E7EB] rounded-lg font-medium text-sm text-[#374151] hover:bg-gray-50 transition-colors"
					>
						{t("signup")}
					</button>
				</div>

				<p className="text-center text-xs text-[#9CA3AF] mt-6">
					{t("supportNotice")}{" "}
					<span className="text-imsg-blue font-medium">{t("supportPhone")}</span>
				</p>
			</div>
		</div>
	);
}