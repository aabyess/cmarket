import type { CertificationsProps } from "@/features/siteBuilder/types";

type SiteRendererCertificationsProps = {
	props: CertificationsProps;
};

export function SiteRendererCertifications({
	props,
}: SiteRendererCertificationsProps): React.JSX.Element {
	return (
		<section className="rounded-2xl border border-[#E5E7EB] bg-white px-10 py-8">
			{props.heading && (
				<h3 className="mb-4 text-[17px] font-bold text-[#1F2937]">{props.heading}</h3>
			)}

			<div className="flex flex-wrap gap-2">
				{props.items.map((item) => (
					<span
						key={item}
						className="flex items-center gap-1.5 rounded-full border border-[#E5E7EB] px-3.5 py-1.5 text-[13px] text-[#374151]">
						<span className="size-1.5 rounded-full bg-[#3B82F6]" />
						{item}
					</span>
				))}
			</div>
		</section>
	);
}
