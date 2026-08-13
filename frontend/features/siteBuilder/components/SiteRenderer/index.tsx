import { SiteRendererCertifications } from "@/features/siteBuilder/components/SiteRenderer/SiteRendererCertifications";
import { SiteRendererContact } from "@/features/siteBuilder/components/SiteRenderer/SiteRendererContact";
import { SiteRendererCta } from "@/features/siteBuilder/components/SiteRenderer/SiteRendererCta";
import { SiteRendererGallery } from "@/features/siteBuilder/components/SiteRenderer/SiteRendererGallery";
import { SiteRendererHero } from "@/features/siteBuilder/components/SiteRenderer/SiteRendererHero";
import { SiteRendererProducts } from "@/features/siteBuilder/components/SiteRenderer/SiteRendererProducts";
import { SiteRendererStats } from "@/features/siteBuilder/components/SiteRenderer/SiteRendererStats";
import { SiteRendererText } from "@/features/siteBuilder/components/SiteRenderer/SiteRendererText";
import type { Block } from "@/features/siteBuilder/types";

type SiteRendererProps = {
	blocks: Block[];
};

function renderBlock(block: Block): React.JSX.Element {
	switch (block.type) {
		case "HERO":
			return <SiteRendererHero props={block.props} />;
		case "TEXT":
			return <SiteRendererText props={block.props} />;
		case "PRODUCTS":
			return <SiteRendererProducts props={block.props} />;
		case "CERTIFICATIONS":
			return <SiteRendererCertifications props={block.props} />;
		case "CONTACT":
			return <SiteRendererContact props={block.props} />;
		case "GALLERY":
			return <SiteRendererGallery props={block.props} />;
		case "STATS":
			return <SiteRendererStats props={block.props} />;
		case "CTA":
			return <SiteRendererCta props={block.props} />;
	}
}

export function SiteRenderer({ blocks }: SiteRendererProps): React.JSX.Element {
	return (
		<div className="space-y-5">
			{blocks.map((block) => (
				<div key={block.id}>{renderBlock(block)}</div>
			))}
		</div>
	);
}
