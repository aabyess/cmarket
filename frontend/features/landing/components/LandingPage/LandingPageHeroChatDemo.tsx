// features/landing/components/LandingPage/LandingPageHeroChatDemo.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { FileCheck2, FileText, Languages, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

// 대화의 시작(견적서 발송)부터 몇 턴을 주고받다 계약 완료로 끝나는 완결된 미니
// 시나리오. 스크롤로 카드가 보일 때 한 번만 재생되고 끝나면(CONTRACT_DONE) 그
// 상태로 멈춘다 — 루프하지 않는다.
const STEP = {
	OPENING_TYPING: 1,
	OPENING_MESSAGE: 2,
	OPENING_TRANSLATING: 3,
	OPENING_TRANSLATED: 4,
	QUOTE_CARD: 5,
	QUESTION_TYPING: 6,
	QUESTION_MESSAGE: 7,
	REPLY_TYPING: 8,
	REPLY_MESSAGE: 9,
	CONFIRM_TYPING: 10,
	CONFIRM_MESSAGE: 11,
	CONTRACT_DONE: 12,
} as const;
const FINAL_STEP = STEP.CONTRACT_DONE;

const SEQUENCE: { step: number; delay: number }[] = [
	{ step: STEP.OPENING_TYPING, delay: 0 },
	{ step: STEP.OPENING_MESSAGE, delay: 600 },
	{ step: STEP.OPENING_TRANSLATING, delay: 1000 },
	{ step: STEP.OPENING_TRANSLATED, delay: 1600 },
	{ step: STEP.QUOTE_CARD, delay: 2200 },
	{ step: STEP.QUESTION_TYPING, delay: 2900 },
	{ step: STEP.QUESTION_MESSAGE, delay: 3500 },
	{ step: STEP.REPLY_TYPING, delay: 4100 },
	{ step: STEP.REPLY_MESSAGE, delay: 4700 },
	{ step: STEP.CONFIRM_TYPING, delay: 5300 },
	{ step: STEP.CONFIRM_MESSAGE, delay: 5900 },
	{ step: STEP.CONTRACT_DONE, delay: 6500 },
];

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

	// 새 단계가 나타날 때마다 맨 아래로 — scrollIntoView는 조상 스크롤 컨테이너(페이지
	// 전체 포함)까지 건드릴 수 있어서, 이 카드 자신의 scrollTop만 직접 조작한다.
	useEffect(() => {
		if (step === 0) return;
		containerRef.current?.scrollTo({
			top: containerRef.current.scrollHeight,
			behavior: prefersReducedMotion ? "instant" : "smooth",
		});
	}, [step, prefersReducedMotion]);

	const transition = prefersReducedMotion ? { duration: 0 } : { duration: 0.25 };

	return (
		<div ref={containerRef} className="flex max-h-[420px] flex-col gap-3 overflow-y-auto p-5">
			{/* 1. 상대측 — 견적서 발송 오프닝 메시지 (+번역) */}
			{step >= STEP.OPENING_TYPING && (
				<div className="max-w-[85%] self-start">
					<AnimatePresence mode="wait">
						{step === STEP.OPENING_TYPING ? (
							<motion.div
								key="opening-typing"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={transition}
								className="bg-imsg-gray flex w-fit items-center rounded-[18px] px-4 py-2.5">
								<TypingDots dotClassName="bg-black/40" />
							</motion.div>
						) : (
							<motion.div
								key="opening-message"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={transition}
								className="bg-imsg-gray rounded-[18px] px-4 py-2.5 text-sm text-black">
								{t("heroDemoOpening")}
							</motion.div>
						)}
					</AnimatePresence>

					{step >= STEP.OPENING_TRANSLATING && (
						<AnimatePresence mode="wait">
							{step === STEP.OPENING_TRANSLATING ? (
								<motion.div
									key="opening-translating"
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
									key="opening-translated"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={transition}>
									<div className="font-landing-doc text-landing-dim mt-1.5 flex items-center gap-1 text-[11px]">
										<Languages size={11} />
										{t("heroDemoTranslatedLabel")}
									</div>
									<div className="text-landing-dim border-landing-line mt-1 w-fit rounded-[14px] border border-dashed px-3 py-1.5 text-xs">
										{t("heroDemoOpeningTranslated")}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					)}
				</div>
			)}

			{/* 2. 상대측 — 견적서 카드 */}
			{step >= STEP.QUOTE_CARD && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={transition}
					className="border-landing-line flex max-w-[85%] items-center gap-2.5 self-start rounded-[14px] border px-4 py-3">
					<span className="border-landing-ink/20 text-landing-ink flex size-8 shrink-0 items-center justify-center rounded-sm border">
						<FileText size={14} />
					</span>
					<div className="min-w-0">
						<p className="font-landing-doc truncate text-xs font-medium">{t("heroDemoQuote")}</p>
						<p className="text-landing-dim text-xs">{t("heroDemoQuoteHint")}</p>
					</div>
				</motion.div>
			)}

			{/* 3. 내 쪽 — 배송일 질문 (번역 없음, 이미 내 언어) */}
			{step >= STEP.QUESTION_TYPING && (
				<AnimatePresence mode="wait">
					{step === STEP.QUESTION_TYPING ? (
						<motion.div
							key="question-typing"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={transition}
							className="bg-imsg-blue flex w-fit max-w-[85%] items-center self-end rounded-[18px] px-4 py-2.5">
							<TypingDots dotClassName="bg-white/70" />
						</motion.div>
					) : (
						<motion.div
							key="question-message"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={transition}
							className="bg-imsg-blue max-w-[85%] self-end rounded-[18px] px-4 py-2.5 text-sm text-white">
							{t("heroDemoTranslated")}
						</motion.div>
					)}
				</AnimatePresence>
			)}

			{/* 4. 상대측 — 배송일 답변 */}
			{step >= STEP.REPLY_TYPING && (
				<AnimatePresence mode="wait">
					{step === STEP.REPLY_TYPING ? (
						<motion.div
							key="reply-typing"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={transition}
							className="bg-imsg-gray flex w-fit items-center self-start rounded-[18px] px-4 py-2.5">
							<TypingDots dotClassName="bg-black/40" />
						</motion.div>
					) : (
						<motion.div
							key="reply-message"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={transition}
							className="bg-imsg-gray max-w-[85%] self-start rounded-[18px] px-4 py-2.5 text-sm text-black">
							{t("heroDemoReply")}
						</motion.div>
					)}
				</AnimatePresence>
			)}

			{/* 5. 내 쪽 — 계약 진행 의사 */}
			{step >= STEP.CONFIRM_TYPING && (
				<AnimatePresence mode="wait">
					{step === STEP.CONFIRM_TYPING ? (
						<motion.div
							key="confirm-typing"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={transition}
							className="bg-imsg-blue flex w-fit max-w-[85%] items-center self-end rounded-[18px] px-4 py-2.5">
							<TypingDots dotClassName="bg-white/70" />
						</motion.div>
					) : (
						<motion.div
							key="confirm-message"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={transition}
							className="bg-imsg-blue max-w-[85%] self-end rounded-[18px] px-4 py-2.5 text-sm text-white">
							{t("heroDemoConfirm")}
						</motion.div>
					)}
				</AnimatePresence>
			)}

			{/* 6. 상대측 — 서명된 계약서(최종 상태) */}
			{step >= STEP.CONTRACT_DONE && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={transition}
					className="flex max-w-[85%] items-center gap-2.5 self-start rounded-[14px] border border-[#22C55E]/30 bg-[#22C55E]/5 px-4 py-3">
					<span className="flex size-8 shrink-0 items-center justify-center rounded-sm border border-[#22C55E]/30 text-[#22C55E]">
						<FileCheck2 size={14} />
					</span>
					<div className="min-w-0">
						<p className="font-landing-doc truncate text-xs font-medium">
							{t("heroDemoContractDone")}
						</p>
						<p className="text-xs text-[#22C55E]">{t("heroDemoContractDoneHint")}</p>
					</div>
				</motion.div>
			)}
		</div>
	);
}
