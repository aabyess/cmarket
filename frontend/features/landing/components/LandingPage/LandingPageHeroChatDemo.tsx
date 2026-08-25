// features/landing/components/LandingPage/LandingPageHeroChatDemo.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { FileCheck2, FileText, Languages, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

// 대화의 시작(견적서 발송)부터 몇 턴을 주고받다 계약 완료로 끝나는 완결된 미니
// 시나리오. 상대측 메시지뿐 아니라 내가 보내는 메시지도 상대 언어로 자동 번역되는
// 걸 보여줘서(양방향) "실시간 자동 번역" 컨셉이 대화 내내 일관되게 이어지도록 한다.
// 스크롤로 카드가 보일 때 한 번만 재생되고 끝나면(CONTRACT_DONE) 그 상태로
// 멈춘다 — 루프하지 않는다.
const STEP = {
	OPENING_TYPING: 1,
	OPENING_MESSAGE: 2,
	OPENING_TRANSLATING: 3,
	OPENING_TRANSLATED: 4,
	QUOTE_CARD: 5,
	QUESTION_TYPING: 6,
	QUESTION_MESSAGE: 7,
	QUESTION_TRANSLATING: 8,
	QUESTION_TRANSLATED: 9,
	REPLY_TYPING: 10,
	REPLY_MESSAGE: 11,
	REPLY_TRANSLATING: 12,
	REPLY_TRANSLATED: 13,
	CONFIRM_TYPING: 14,
	CONFIRM_MESSAGE: 15,
	CONFIRM_TRANSLATING: 16,
	CONFIRM_TRANSLATED: 17,
	CONTRACT_DONE: 18,
} as const;
const FINAL_STEP = STEP.CONTRACT_DONE;

const SEQUENCE: { step: number; delay: number }[] = [
	{ step: STEP.OPENING_TYPING, delay: 0 },
	{ step: STEP.OPENING_MESSAGE, delay: 500 },
	{ step: STEP.OPENING_TRANSLATING, delay: 900 },
	{ step: STEP.OPENING_TRANSLATED, delay: 1400 },
	{ step: STEP.QUOTE_CARD, delay: 1900 },
	{ step: STEP.QUESTION_TYPING, delay: 2400 },
	{ step: STEP.QUESTION_MESSAGE, delay: 2900 },
	{ step: STEP.QUESTION_TRANSLATING, delay: 3300 },
	{ step: STEP.QUESTION_TRANSLATED, delay: 3800 },
	{ step: STEP.REPLY_TYPING, delay: 4300 },
	{ step: STEP.REPLY_MESSAGE, delay: 4800 },
	{ step: STEP.REPLY_TRANSLATING, delay: 5200 },
	{ step: STEP.REPLY_TRANSLATED, delay: 5700 },
	{ step: STEP.CONFIRM_TYPING, delay: 6200 },
	{ step: STEP.CONFIRM_MESSAGE, delay: 6700 },
	{ step: STEP.CONFIRM_TRANSLATING, delay: 7100 },
	{ step: STEP.CONFIRM_TRANSLATED, delay: 7600 },
	{ step: STEP.CONTRACT_DONE, delay: 8200 },
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

type ChatTurnProps = {
	currentStep: number;
	typingStep: number;
	translatingStep: number;
	isMine: boolean;
	message: string;
	translated: string;
	translatedLabel: string;
	transition: { duration: number };
};

// 한 턴(타이핑→메시지→번역 중→번역됨)의 시각 언어를 상대측/내 쪽 공용으로 재사용한다.
// isMine이면 파란 말풍선+우측 정렬, 아니면 회색 말풍선+좌측 정렬만 다르고 나머지
// 시퀀스는 동일하다 — 이게 "양방향 자동 번역"을 일관되게 보여주는 핵심이다.
function ChatTurn({
	currentStep,
	typingStep,
	translatingStep,
	isMine,
	message,
	translated,
	translatedLabel,
	transition,
}: ChatTurnProps): React.ReactNode {
	if (currentStep < typingStep) return null;

	return (
		<div className={cn("max-w-[85%]", isMine ? "self-end" : "self-start")}>
			<AnimatePresence mode="wait">
				{currentStep === typingStep ? (
					<motion.div
						key="typing"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={transition}
						className={cn(
							"flex w-fit items-center rounded-[18px] px-4 py-2.5",
							isMine ? "bg-imsg-blue" : "bg-imsg-gray",
						)}>
						<TypingDots dotClassName={isMine ? "bg-white/70" : "bg-black/40"} />
					</motion.div>
				) : (
					<motion.div
						key="message"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={transition}
						className={cn(
							"rounded-[18px] px-4 py-2.5 text-sm",
							isMine ? "bg-imsg-blue text-white" : "bg-imsg-gray text-black",
						)}>
						{message}
					</motion.div>
				)}
			</AnimatePresence>

			{currentStep >= translatingStep && (
				<AnimatePresence mode="wait">
					{currentStep === translatingStep ? (
						<motion.div
							key="translating"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={transition}
							className={cn(
								"font-landing-doc text-landing-dim mt-1.5 flex items-center gap-1 text-[11px]",
								isMine && "justify-end",
							)}>
							<Loader2 size={11} className="animate-spin" />
							{translatedLabel}
						</motion.div>
					) : (
						<motion.div
							key="translated"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={transition}
							className={cn("flex flex-col", isMine ? "items-end" : "items-start")}>
							<div className="font-landing-doc text-landing-dim mt-1.5 flex items-center gap-1 text-[11px]">
								<Languages size={11} />
								{translatedLabel}
							</div>
							<div className="text-landing-dim border-landing-line mt-1 w-fit rounded-[14px] border border-dashed px-3 py-1.5 text-xs">
								{translated}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			)}
		</div>
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
	const translatedLabel = t("heroDemoTranslatedLabel");

	return (
		<div ref={containerRef} className="flex max-h-[420px] flex-col gap-3 overflow-y-auto p-5">
			{/* 1. 상대측 — 견적서 발송 오프닝 메시지 (+번역) */}
			<ChatTurn
				currentStep={step}
				typingStep={STEP.OPENING_TYPING}
				translatingStep={STEP.OPENING_TRANSLATING}
				isMine={false}
				message={t("heroDemoOpening")}
				translated={t("heroDemoOpeningTranslated")}
				translatedLabel={translatedLabel}
				transition={transition}
			/>

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

			{/* 3. 내 쪽 — 배송일 질문 (+상대 언어로 번역) */}
			<ChatTurn
				currentStep={step}
				typingStep={STEP.QUESTION_TYPING}
				translatingStep={STEP.QUESTION_TRANSLATING}
				isMine={true}
				message={t("heroDemoTranslated")}
				translated={t("heroDemoQuestionTranslated")}
				translatedLabel={translatedLabel}
				transition={transition}
			/>

			{/* 4. 상대측 — 배송일 답변 (+번역) */}
			<ChatTurn
				currentStep={step}
				typingStep={STEP.REPLY_TYPING}
				translatingStep={STEP.REPLY_TRANSLATING}
				isMine={false}
				message={t("heroDemoReply")}
				translated={t("heroDemoReplyTranslated")}
				translatedLabel={translatedLabel}
				transition={transition}
			/>

			{/* 5. 내 쪽 — 계약 진행 의사 (+상대 언어로 번역) */}
			<ChatTurn
				currentStep={step}
				typingStep={STEP.CONFIRM_TYPING}
				translatingStep={STEP.CONFIRM_TRANSLATING}
				isMine={true}
				message={t("heroDemoConfirm")}
				translated={t("heroDemoConfirmTranslated")}
				translatedLabel={translatedLabel}
				transition={transition}
			/>

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
