// app/[locale]/page.tsx
import { redirect } from "@/i18n/navigation";

export default async function Home({ params }: { params: Promise<{ locale: string }> }): Promise<void> {
	const { locale } = await params;
	redirect({ href: "/login", locale });
}