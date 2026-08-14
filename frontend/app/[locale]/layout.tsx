import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { QueryProvider } from "@/libs/QueryProvider";
import "../globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/utils/cn";
import { routing } from "@/i18n/routing";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
    title: "MitraPay | Korea × Indonesia B2B Marketplace",
    description: "한국-인도네시아 기업 간 신뢰할 수 있는 글로벌 조달 플랫폼",
    icons: {
        icon: "/favicon.png",
        apple: "/favicon.png",
    },
};

type RootLayoutProps = {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: RootLayoutProps): Promise<React.JSX.Element> {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) notFound();

	setRequestLocale(locale);

	return (
		<html lang={locale} className={cn("font-sans", geist.variable)} suppressHydrationWarning>
			<body>
				<NextIntlClientProvider>
					<QueryProvider>{children}</QueryProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
