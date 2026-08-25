// features/landing/components/LandingPage/LandingPageHeroChatDemo.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { FileText, Languages, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

// 실제 채팅처럼 단계가 넘어가는 시퀀스. 스크롤로 카드가 보일 때 한 번만 재생되고
// 끝나면(step 7) 그 상태로 멈춘다 — 루프하지 않는다.
const SEQUENCE: { step: number; delay: number }[] = [
	{ step: 1, delay: 0 }, // 수신 타이핑
	{ step: 2, delay: 700 }, // 수신 메시지
	{ step: 3, delay: 1100 }, // 번역 중
	{ step: 4, delay: 1700 }, // 번역문
	{ step: 5, delay: 2300 }, // 답장 타이핑
	{ step: 6, delay: 2900 }, // 답장 메시지
	{ step: 7, delay: 3400 }, // 견적 카드(최종 상태)
];
const FINAL_STEP = 7;

function TypingDots({ dotClassName }: { dotClassName: string }): React.ReactNode {
	return (
		<span aria-hidden className="flex items-center gap-1 py-0.5">
			{[0, 1, 2].map((i) => (
				<span
					key={i}
					className={cn("size-1.5 animate-bounce rounded-full", dotClassName)}
					style={{ animationDelay: `${i * 0.15}s` }}
				/>
			))}
		</span>
	);
}

export function LandingPageHeroChatDemo(): React.ReactNode {
	const t = useTranslations("Landing");
	const prefersReducedMotion = useReducedMotion();
	const containerRef = useRef<HTMLDivElement>(null);
	const isInView = useInView(containerRef, { once: true, amount: 0.4 });
	const [step, setStep] = useState(0);

	useEffect(() => {
		if (prefersReducedMotion) {
			setStep(FINAL_STEP);
			return;
		}
		if (!isInView) return;
		const timers = SEQUENCE.map(({ step: s, delay }) => setTimeout(() => setStep(s), delay));
		return () => timers.forEach(clearTimeout);
	}, [isInView, prefersReducedMotion]);

	const transition = prefersReducedMotion ? { duration: 0 } : { duration: 0.25 };

	return (
		<div ref={containerRef} className="flex flex-col gap-3 p-5">
			{step >= 1 && (
				<div className="max-w-[85%] self-start">
					<AnimatePresence mode="wait">
						{step === 1 ? (
							<motion.div
								key="incoming-typing"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={transition}
								className="bg-imsg-gray flex w-fit items-center rounded-[18px] px-4 py-2.5">
								<TypingDots dotClassName="bg-black/40" />
							</motion.div>
						) : (
							<motion.div
								key="incoming-message"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={transition}
								className="bg-imsg-gray rounded-[18px] px-4 py-2.5 text-sm text-black">
								{t("heroDemoIncoming")}
							</motion.div>
						)}
					</AnimatePresence>

					{step >= 3 && (
						<AnimatePresence mode="wait">
							{step === 3 ? (
								<motion.div
									key="translating"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={transition}
									className="font-landing-doc text-landing-dim mt-1.5 flex items-center gap-1 text-[11px]">
									<Loader2 size={11} className="animate-spin" />
									{t("heroDemoTranslatedLabel")}
								</motion.div>
							) : (
								<motion.div
									key="translated"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={transition}>
									<div className="font-landing-doc text-landing-dim mt-1.5 flex items-center gap-1 text-[11px]">
										<Languages size={11} />
										{t("heroDemoTranslatedLabel")}
									</div>
									<div className="text-landing-dim border-landing-line mt-1 w-fit rounded-[14px] border border-dashed px-3 py-1.5 text-xs">
										{t("heroDemoTranslated")}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					)}
				</div>
			)}

			{step >= 5 && (
				<AnimatePresence mode="wait">
					{step === 5 ? (
						<motion.div
							key="reply-typing"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={transition}
							className="bg-imsg-blue flex w-fit max-w-[85%] items-center self-end rounded-[18px] px-4 py-2.5">
							<TypingDots dotClassName="bg-white/70" />
						</motion.div>
					) : (
						<motion.div
							key="reply-message"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={transition}
							className="bg-imsg-blue max-w-[85%] self-end rounded-[18px] px-4 py-2.5 text-sm text-white">
							{t("heroDemoReply")}
						</motion.div>
					)}
				</AnimatePresence>
			)}

			{step >= 7 && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={transition}
					className="border-landing-line flex max-w-[85%] items-center gap-2.5 self-end rounded-[14px] border px-4 py-3">
					<span className="border-landing-ink/20 text-landing-ink flex size-8 shrink-0 items-center justify-center rounded-sm border">
						<FileText size={14} />
					</span>
					<div className="min-w-0">
						<p className="font-landing-doc truncate text-xs font-medium">{t("heroDemoQuote")}</p>
						<p className="text-landing-dim text-xs">{t("heroDemoQuoteHint")}</p>
					</div>
				</motion.div>
			)}
		</div>
	);
}
