// app/[locale]/page.tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createServerSupabaseClient } from "@/libs/supabaseServer";
import { LandingPage } from "@/features/landing/components/LandingPage";

type HomeProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: HomeProps): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Landing" });
	return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function Home({ params }: HomeProps): Promise<React.JSX.Element> {
	const { locale } = await params;
	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// 로그인한 사용자는 랜딩 대신 역할에 맞는 대시보드로 보낸다
	if (user) {
		const { data: profile } = await supabase
			.from("profiles")
			.select("role")
			.eq("id", user.id)
			.single();
		redirect({
			href: profile?.role === "seller" ? "/seller/dashboard" : "/buyer/dashboard",
			locale,
		});
	}

	return <LandingPage />;
}
