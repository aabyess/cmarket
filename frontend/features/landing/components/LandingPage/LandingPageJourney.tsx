// features/landing/components/LandingPage/LandingPageJourney.tsx
import { getTranslations } from "next-intl/server";
import { FileCheck2, FileSignature, FileText, Package, Receipt } from "lucide-react";
import { LandingPageReveal } from "@/features/landing/components/LandingPage/LandingPageReveal";

/** Steps와 같은 문서 코드를 재사용 — 같은 서류가 여기서는 실제 화면 축소판으로
 * 다시 등장한다는 걸 시각적으로 잇는다. */
const JOURNEY_DOC_CODES = ["RFQ", "QUOTATION", "CONTRACT", "INVOICE", "BAST"];

export async function LandingPageJourney(): Promise<React.JSX.Element> {
	const t = await getTranslations("Landing");
	const items = [1, 2, 3, 4, 5].map((n, i) => ({
		code: JOURNEY_DOC_CODES[i],
		day: t(`journey${n}Day`),
		title: t(`journey${n}Title`),
		detail: t(`journey${n}Detail`),
	}));

	return (
		<section className="border-landing-line border-t bg-white">
			<div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
				<LandingPageReveal>
					<h2 className="max-w-xl text-3xl font-bold tracking-tight">{t("journeyTitle")}</h2>
					<p className="text-landing-dim mt-3 text-sm">{t("journeySubtitle")}</p>
				</LandingPageReveal>

				<div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
					{/* 1. 공고 등록 — 실제 공고 리스트 카드의 상태뱃지+제목 문법 축소판 */}
					<LandingPageReveal delay={0}>
						<JourneyMoment day={items[0].day}>
							<div className="border-hairline rounded-xl border bg-white p-3 shadow-sm">
								<span className="text-imsg-blue inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-medium">
									<Package size={10} />
									{items[0].code}
								</span>
								<p className="mt-2 truncate text-xs font-semibold text-[#0f172a]">
									{items[0].title}
								</p>
								<p className="text-muted mt-0.5 text-[11px]">{items[0].detail}</p>
							</div>
						</JourneyMoment>
					</LandingPageReveal>

					{/* 2. 견적 도착 — 히어로 채팅 데모와 동일한 말풍선+견적카드 문법 */}
					<LandingPageReveal delay={0.06}>
						<JourneyMoment day={items[1].day}>
							<div className="bg-imsg-gray rounded-[14px] px-3 py-2 text-[11px] text-black">
								{items[1].title}
							</div>
							<div className="border-hairline mt-1.5 flex items-center gap-2 rounded-[12px] border bg-white px-2.5 py-2 shadow-sm">
								<span className="text-imsg-blue border-imsg-blue/25 flex size-6 shrink-0 items-center justify-center rounded-sm border">
									<FileText size={11} />
								</span>
								<p className="text-muted min-w-0 truncate text-[11px]">{items[1].detail}</p>
							</div>
						</JourneyMoment>
					</LandingPageReveal>

					{/* 3. 계약 확정 — 문서 카드 문법(견적카드와 같은 아이콘 사각형 스타일) */}
					<LandingPageReveal delay={0.12}>
						<JourneyMoment day={items[2].day}>
							<div className="border-hairline flex items-center gap-2.5 rounded-xl border bg-white p-3 shadow-sm">
								<span className="text-imsg-blue border-imsg-blue/25 flex size-8 shrink-0 items-center justify-center rounded-sm border">
									<FileSignature size={14} />
								</span>
								<div className="min-w-0">
									<p className="truncate text-xs font-semibold text-[#0f172a]">{items[2].title}</p>
									<p className="text-muted text-[11px]">{items[2].detail}</p>
								</div>
							</div>
						</JourneyMoment>
					</LandingPageReveal>

					{/* 4. 인보이스·송금 — 문서 카드 + 결제확인 뱃지(실제 상태뱃지 색 재사용) */}
					<LandingPageReveal delay={0.18}>
						<JourneyMoment day={items[3].day}>
							<div className="border-hairline flex items-center gap-2.5 rounded-xl border bg-white p-3 shadow-sm">
								<span className="text-imsg-blue border-imsg-blue/25 flex size-8 shrink-0 items-center justify-center rounded-sm border">
									<Receipt size={14} />
								</span>
								<div className="min-w-0">
									<p className="truncate text-xs font-semibold text-[#0f172a]">{items[3].title}</p>
									<span className="mt-0.5 inline-block rounded-full bg-[#F0FDF4] px-1.5 py-0.5 text-[10px] font-medium text-[#16A34A]">
										{items[3].detail}
									</span>
								</div>
							</div>
						</JourneyMoment>
					</LandingPageReveal>

					{/* 5. 납품 확인(BAST) — 히어로 마지막 계약완료 카드와 동일한 초록 체크 문법 */}
					<LandingPageReveal delay={0.24}>
						<JourneyMoment day={items[4].day}>
							<div className="flex items-center gap-2.5 rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/5 p-3">
								<span className="flex size-8 shrink-0 items-center justify-center rounded-sm border border-[#22C55E]/30 text-[#22C55E]">
									<FileCheck2 size={14} />
								</span>
								<div className="min-w-0">
									<p className="truncate text-xs font-semibold text-[#0f172a]">{items[4].title}</p>
									<p className="text-[11px] text-[#22C55E]">{items[4].detail}</p>
								</div>
							</div>
						</JourneyMoment>
					</LandingPageReveal>
				</div>
			</div>
		</section>
	);
}

type JourneyMomentProps = {
	day: string;
	children: React.ReactNode;
};

/** 각 순간 공통 래퍼 — Day 라벨(랜딩 타이포)과 실제 화면 축소판(앱 타이포/색)을
 * 시각적으로 분리해서, 어디까지가 "우리 UI를 그대로 가져온 것"인지 명확히 한다. */
function JourneyMoment({ day, children }: JourneyMomentProps): React.JSX.Element {
	return (
		<div className="flex h-full flex-col gap-2">
			<span className="font-landing-doc text-landing-dim text-[11px] font-semibold tracking-[0.14em] uppercase">
				{day}
			</span>
			<div className="flex flex-1 flex-col justify-center gap-1.5 rounded-2xl bg-[#F7F8FA] p-3">
				{children}
			</div>
		</div>
	);
}
