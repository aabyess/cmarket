import type { Metadata } from "next";
import { QueryProvider } from "@/libs/QueryProvider";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/utils/cn";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
	title: "K-NUSA | Korea × Indonesia B2B Marketplace",
	description: "한국-인도네시아 기업 간 신뢰할 수 있는 글로벌 조달 플랫폼",
	icons: {
	  icon: "/favicon.png",
	  apple: "/favicon.png",
	},
  };
type RootLayoutProps = {
	children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
	return (
		<html lang="ko" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
			<body>
				<QueryProvider>{children}</QueryProvider>
			</body>
		</html>
	);
}