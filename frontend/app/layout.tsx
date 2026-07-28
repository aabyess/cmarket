// app/layout.tsx
import type { Metadata } from "next";
import { QueryProvider } from "@/libs/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
	title: "C-Market | 한국-인도네시아 B2B 거래 플랫폼",
	description: "신뢰할 수 있는 파트너와 함께하는 글로벌 조달 플랫폼",
};

type RootLayoutProps = {
	children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
	return (
		<html lang="ko">
			<body>
				<QueryProvider>{children}</QueryProvider>
			</body>
		</html>
	);
}