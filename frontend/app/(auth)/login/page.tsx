"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { postLogin } from "@/features/auth/mutations";
import { SecurityModal } from "@/features/auth/components/SecurityModal";
import { cn } from "@/utils/cn";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [securityStep, setSecurityStep] = useState<"connecting" | "verifying" | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async () => {
		setIsLoading(true);
		setError(null);
		setSecurityStep("connecting");

		await new Promise((resolve) => setTimeout(resolve, 1000));
		setSecurityStep("verifying");

		try {
			await postLogin({ email, password });
			await new Promise((resolve) => setTimeout(resolve, 800));
			router.push("/buyer/dashboard");
		} catch (err) {
			setSecurityStep(null);
			setError("이메일 또는 비밀번호가 올바르지 않습니다.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") handleSubmit();
	};

	return (
		<div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
			{securityStep && <SecurityModal step={securityStep} />}

			<div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-10">
				<div className="flex justify-center mb-8">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-linear-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center">
							<div className="w-4 h-4 bg-white" style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}></div>
						</div>
						<span className="font-bold text-xl text-[#1B3A6B]">C-Market</span>
					</div>
				</div>

				<h1 className="text-2xl font-bold text-center text-[#1F2937] mb-8">로그인</h1>

				<div className="space-y-5">
					<div className="space-y-1.5">
						<label className="text-sm font-medium text-[#374151]">이메일</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="이메일을 입력하세요"
							className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B] transition-colors"
						/>
					</div>

					<div className="space-y-1.5">
						<label className="text-sm font-medium text-[#374151]">비밀번호</label>
						<div className="relative">
							<input
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder="비밀번호를 입력하세요"
								className="w-full px-4 py-3 pr-11 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B] transition-colors"
							/>
							<button
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] transition-colors">
								{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
							</button>
						</div>
					</div>

					{error && <p className="text-sm text-red-500">{error}</p>}

					<button
						onClick={handleSubmit}
						disabled={isLoading || !email || !password}
						className={cn(
							"w-full py-3 rounded-lg font-semibold text-sm transition-all",
							"bg-[#1B3A6B] text-white hover:bg-[#152d54]",
							"disabled:opacity-50 disabled:cursor-not-allowed",
						)}>
						{isLoading ? "로그인 중..." : "로그인"}
					</button>

					<div className="flex items-center gap-3 py-1">
						<div className="flex-1 h-px bg-[#E5E7EB]"></div>
						<span className="text-xs text-[#9CA3AF]">계정이 없으신가요?</span>
						<div className="flex-1 h-px bg-[#E5E7EB]"></div>
					</div>

					<button
						onClick={() => router.push("/signup")}
						className="w-full py-3 border border-[#E5E7EB] rounded-lg font-medium text-sm text-[#374151] hover:bg-gray-50 transition-colors">
						회원가입하기
					</button>
				</div>

				<p className="text-center text-xs text-[#9CA3AF] mt-8">
					솔루션 문의는 전문 컨설턴트가 도와드립니다.{" "}
					<span className="text-[#1B3A6B] font-medium">고객센터 02-742-9217</span>
				</p>
			</div>
		</div>
	);
}