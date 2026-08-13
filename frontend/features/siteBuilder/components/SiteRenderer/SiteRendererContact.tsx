import Link from "next/link";
import type { ContactProps } from "@/features/siteBuilder/types";

type SiteRendererContactProps = {
	props: ContactProps;
};

export function SiteRendererContact({ props }: SiteRendererContactProps): React.JSX.Element {
	const items = [
		{ label: "담당자", value: props.managerName },
		{ label: "이메일", value: props.email },
		{ label: "전화", value: props.phone },
		{ label: "주소", value: props.address },
	].filter((item) => item.value);

	return (
		<section className="rounded-2xl border border-[#E5E7EB] bg-white px-10 py-8">
			{props.heading && (
				<h3 className="mb-4 text-[17px] font-bold text-[#1F2937]">{props.heading}</h3>
			)}

			<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
				{items.map((item) => (
					<div key={item.label}>
						<p className="text-[11px] text-[#9CA3AF]">{item.label}</p>
						<p className="mt-0.5 text-sm font-medium text-[#374151]">{item.value}</p>
					</div>
				))}

				{props.website && (
					<div>
						<p className="text-[11px] text-[#9CA3AF]">홈페이지</p>
						<Link
							href={props.website}
							target="_blank"
							rel="noopener noreferrer"
							className="mt-0.5 block text-sm font-medium text-[#3B82F6] hover:underline">
							{props.website}
						</Link>
					</div>
				)}
			</div>
		</section>
	);
}
