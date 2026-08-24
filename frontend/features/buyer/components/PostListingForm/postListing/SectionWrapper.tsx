"use client";

interface SectionWrapperProps {
	title: string;
	subtitle?: string;
	children: React.ReactNode;
}

export default function SectionWrapper({ title, subtitle, children }: SectionWrapperProps) {
	return (
		<div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
			<div className="border-imsg-blue mb-6 border-l-4 pl-4">
				<h2 className="text-base font-semibold text-[#0f172a]">{title}</h2>
				{subtitle && <p className="mt-1 text-sm text-[#6B7280]">{subtitle}</p>}
			</div>
			{children}
		</div>
	);
}
