"use client";

interface SectionWrapperProps {
	title: string;
	subtitle?: string;
	children: React.ReactNode;
}

export default function SectionWrapper({ title, subtitle, children }: SectionWrapperProps) {
	return (
		<div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
			<div className="border-l-4 border-[#1B3A6B] pl-4 mb-6">
				<h2 className="text-xl font-bold text-gray-900">{title}</h2>
				{subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
			</div>
			{children}
		</div>
	);
}