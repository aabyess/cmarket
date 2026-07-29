"use client";

import { Shield } from "lucide-react";

type SecurityModalProps = {
	step: "connecting" | "verifying";
};

export function SecurityModal({ step }: SecurityModalProps) {
	return (
		<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
			<div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-4 w-80 shadow-xl">
				{/* 아이콘 */}
				<div className="relative">
					<div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
						<Shield size={32} className="text-white" />
					</div>
					<div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-300 animate-spin" style={{ animationDuration: "3s" }} />
				</div>

				{/* 텍스트 */}
				<div className="flex flex-col items-center gap-1 text-center">
					{step === "connecting" ? (
						<>
							<p className="font-semibold text-[#1F2937]">보안 연결을 수립하는 중입니다</p>
							<p className="text-sm text-blue-500">안전하게 로그인하고 있어요</p>
						</>
					) : (
						<>
							<p className="font-semibold text-[#1F2937]">입력하신 정보를 확인하고 있어요</p>
							<p className="text-sm text-blue-500">안전하게 로그인하고 있어요</p>
						</>
					)}
				</div>

				{/* SSL 표시 */}
				<div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
					<Shield size={12} />
					<span>SSL 암호화 보안 접속</span>
				</div>
			</div>
		</div>
	);
}