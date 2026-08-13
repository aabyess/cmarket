import Image from "next/image";
import type { GalleryProps } from "@/features/siteBuilder/types";

type SiteRendererGalleryProps = {
	props: GalleryProps;
};

export function SiteRendererGallery({ props }: SiteRendererGalleryProps): React.JSX.Element {
	return (
		<section className="rounded-2xl border border-[#E5E7EB] bg-white px-10 py-8">
			{props.heading && (
				<h3 className="mb-4 text-[17px] font-bold text-[#1F2937]">{props.heading}</h3>
			)}

			<div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
				{props.imageUrls.map((url) => (
					<div
						key={url}
						className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#F3F4F6]"
					>
						<Image
							src={url}
							alt=""
							fill
							sizes="(min-width: 640px) 25vw, 50vw"
							className="object-cover"
						/>
					</div>
				))}
			</div>
		</section>
	);
}
