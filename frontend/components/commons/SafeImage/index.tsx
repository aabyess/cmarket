// components/commons/SafeImage/index.tsx
import Image from "next/image";
import { ALLOWED_IMAGE_HOSTS } from "@/constants/images";

function isAllowedImageHost(src: string): boolean {
	try {
		return (ALLOWED_IMAGE_HOSTS as readonly string[]).includes(new URL(src).hostname);
	} catch {
		return false;
	}
}

type SafeImageProps = {
	src: string;
	alt: string;
	className?: string;
} & ({ fill: true; sizes: string } | { fill?: false; width: number; height: number });

/**
 * next/image는 next.config.ts에 등록되지 않은 호스트를 만나면 렌더링 시점에 예외를 던진다.
 * logoUrl 등 사용자가 API로 직접 저장할 수 있는 이미지 URL은 업로드 플로우를 거치지 않고도
 * 임의 호스트가 들어올 수 있으므로, 허용 목록 밖이면 평범한 img로 안전하게 우회한다.
 */
export function SafeImage(props: SafeImageProps): React.JSX.Element {
	const { src, alt, className } = props;

	if (!isAllowedImageHost(src)) {
		// eslint-disable-next-line @next/next/no-img-element -- 허용되지 않은 호스트는 next/image가 크래시하므로 의도적으로 우회
		return <img src={src} alt={alt} className={className} />;
	}

	if (props.fill) {
		return <Image src={src} alt={alt} fill sizes={props.sizes} className={className} />;
	}

	return <Image src={src} alt={alt} width={props.width} height={props.height} className={className} />;
}
