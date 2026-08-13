import Link from "next/link";
import type { CtaProps } from "@/features/siteBuilder/types";

type SiteRendererCtaProps = {
	props: CtaProps;
};

export function SiteRendererCta({ props }: SiteRendererCtaProps): React.JSX.Element {
	return (
		<section className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-10 py-10 text-center">
			<h3 className="text-[19px] font-bold text-[#1F2937]">{props.heading}</h3>
			{props.description && <p className="mt-1.5 text-[13px] text-[#6B7280]">{props.description}</p>}

			{props.buttonHref ? (
				<Link
					href={props.buttonHref}
					className="mt-5 inline-block rounded-[10px] bg-[#3B82F6] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]">
					{props.buttonLabel}
				</Link>
			) : (
				<span className="mt-5 inline-block rounded-[10px] bg-[#3B82F6] px-8 py-3 text-sm font-semibold text-white">
					{props.buttonLabel}
				</span>
			)}
		</section>
	);
}
