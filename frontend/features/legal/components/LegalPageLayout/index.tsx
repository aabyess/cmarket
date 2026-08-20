// features/legal/components/LegalPageLayout/index.tsx
import Image from "next/image";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";

type LegalPageLayoutProps = {
	title: string;
	children: React.ReactNode;
};

export function LegalPageLayout({ title, children }: LegalPageLayoutProps): React.ReactNode {
	return (
		<div className="min-h-screen bg-[#f5f5f5] px-4 py-10">
			<div className="mx-auto max-w-2xl">
				<div className="mb-6 flex items-center justify-between">
					<Link
						href="/"
						className="flex items-center gap-1.5 text-sm text-[#6B7280] transition-colors hover:text-[#374151]"
					>
						<ArrowLeft size={16} />
						뒤로가기
					</Link>
					<Image src="/images/MitraPay.png" alt="MitraPay 로고" width={32} height={32} />
				</div>

				<div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
					<AlertTriangle size={18} className="mt-0.5 shrink-0" />
					<p>
						이 문서는 초안입니다. 법률 검토를 거쳐 확정되기 전까지는 참고용으로만 사용해주세요.
					</p>
				</div>

				<div className="rounded-2xl border border-[#E5E7EB] bg-white p-8">
					<h1 className="text-2xl font-bold text-[#1F2937]">{title}</h1>
					<p className="mt-1 text-xs text-[#9CA3AF]">한국어 원문이 우선합니다.</p>
					<div className="mt-6 text-sm leading-relaxed text-[#374151]">{children}</div>
				</div>
			</div>
		</div>
	);
}
