import { Package } from "lucide-react";
import { SafeImage } from "@/components/commons/SafeImage";
import type { ProductsProps } from "@/features/siteBuilder/types";

type SiteRendererProductsProps = {
	props: ProductsProps;
};

export function SiteRendererProducts({ props }: SiteRendererProductsProps): React.JSX.Element {
	return (
		<section className="rounded-2xl border border-[#E5E7EB] bg-white px-10 py-8">
			{props.heading && (
				<h3 className="mb-5 text-[17px] font-bold text-[#1F2937]">{props.heading}</h3>
			)}

			<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
				{props.items.map((item) => (
					<div key={item.id} className="overflow-hidden rounded-xl border border-[#F3F4F6]">
						<div className="relative flex h-28 items-center justify-center bg-[#F3F4F6]">
							{item.imageUrls[0] ? (
								<SafeImage
									src={item.imageUrls[0]}
									alt={item.name}
									fill
									sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
									className="object-cover"
								/>
							) : (
								<Package size={22} className="text-[#9CA3AF]" />
							)}
						</div>
						<div className="px-3 py-2.5">
							<p className="text-[13px] font-semibold text-[#1F2937]">{item.name}</p>
							{item.description && (
								<p className="mt-0.5 text-[11px] text-[#9CA3AF]">{item.description}</p>
							)}
							{item.priceRange && (
								<p className="mt-1.5 text-xs font-semibold text-[#3B82F6]">{item.priceRange}</p>
							)}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
