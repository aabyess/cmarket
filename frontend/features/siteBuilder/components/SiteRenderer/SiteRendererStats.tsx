import type { StatsProps } from "@/features/siteBuilder/types";

type SiteRendererStatsProps = {
	props: StatsProps;
};

export function SiteRendererStats({ props }: SiteRendererStatsProps): React.JSX.Element {
	return (
		<section className="rounded-2xl border border-[#E5E7EB] bg-white px-4 sm:px-10 py-8">
			{props.heading && (
				<h3 className="mb-5 text-[17px] font-bold text-[#1F2937]">{props.heading}</h3>
			)}

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{props.items.map((item) => (
					<div key={item.id} className="rounded-xl bg-[#F9FAFB] px-4 py-4 text-center">
						<p className="text-[22px] font-bold tracking-tight text-[#1F2937]">{item.value}</p>
						<p className="mt-1 text-[11px] text-[#6B7280]">{item.label}</p>
					</div>
				))}
			</div>
		</section>
	);
}
