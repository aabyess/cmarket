import type { TextProps } from "@/features/siteBuilder/types";

type SiteRendererTextProps = {
	props: TextProps;
};

export function SiteRendererText({ props }: SiteRendererTextProps): React.JSX.Element {
	return (
		<section className="rounded-2xl border border-[#E5E7EB] bg-white px-10 py-8">
			{props.heading && (
				<h3 className="mb-3 text-[17px] font-bold text-[#1F2937]">{props.heading}</h3>
			)}
			<p className="whitespace-pre-wrap text-sm leading-relaxed text-[#4B5563]">{props.body}</p>
		</section>
	);
}
