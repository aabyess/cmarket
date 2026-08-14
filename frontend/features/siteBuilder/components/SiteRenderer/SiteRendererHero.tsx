import { Link } from "@/i18n/navigation";
import { cva } from "class-variance-authority";
import { Building2 } from "lucide-react";
import { SafeImage } from "@/components/commons/SafeImage";
import type { HeroProps } from "@/features/siteBuilder/types";

type SiteRendererHeroProps = {
	props: HeroProps;
};

const overlayLayer = cva("absolute inset-0", {
	variants: {
		level: {
			none: "hidden",
			light: "bg-black/25",
			medium: "bg-black/45",
			dark: "bg-black/65",
		},
	},
	defaultVariants: { level: "medium" },
});

const ctaButton = cva("rounded-[10px] px-6 py-2.5 text-sm font-semibold transition-colors", {
	variants: {
		emphasis: {
			primary: "bg-white text-[#1E3A8A] hover:bg-white/90",
			secondary: "border border-white/60 text-white hover:bg-white/10",
		},
	},
	defaultVariants: { emphasis: "primary" },
});

export function SiteRendererHero({ props }: SiteRendererHeroProps): React.JSX.Element {
	const background = props.images[0];

	return (
		<section
			className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] px-10 py-12 text-white"
			style={background ? { backgroundImage: `url(${background})`, backgroundSize: "cover" } : undefined}>
			{background && <div className={overlayLayer({ level: props.overlay })} />}

			<div className="relative">
				{props.logoUrl && (
					<div className="mb-4 flex size-14 items-center justify-center overflow-hidden rounded-xl bg-white/20">
						<SafeImage src={props.logoUrl} alt="" width={56} height={56} className="size-full object-cover" />
					</div>
				)}
				{!props.logoUrl && (
					<div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-white/20">
						<Building2 size={24} className="text-white" />
					</div>
				)}

				{props.eyebrow && (
					<p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-white/70">
						{props.eyebrow}
					</p>
				)}

				<h2 className="text-3xl font-bold tracking-tight">
					{props.title}
					{props.titleAccent && <span className="text-[#BFDBFE]"> {props.titleAccent}</span>}
				</h2>

				{props.subtitle && <p className="mt-2 text-[15px] text-white/90">{props.subtitle}</p>}

				{props.chips.length > 0 && (
					<div className="mt-4 flex flex-wrap gap-2">
						{props.chips.map((chip) => (
							<span key={chip} className="rounded-full bg-white/20 px-3 py-1 text-xs">
								{chip}
							</span>
						))}
					</div>
				)}

				{props.ctas.length > 0 && (
					<div className="mt-6 flex flex-wrap gap-2.5">
						{props.ctas.map((cta) => (
							<Link
								key={`${cta.label}-${cta.href}`}
								href={cta.href || "#"}
								className={ctaButton({ emphasis: cta.emphasis })}>
								{cta.label}
							</Link>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
