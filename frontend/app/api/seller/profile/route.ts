import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const {
		logoUrl,
		description,
		establishedYear,
		employeeCount,
		websiteUrl,
		certifications,
		categories,
		products,
	} = await req.json();

	const supabase = await createServerSupabaseClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const admin = await createServerAdminClient();

	const { error: profileError } = await admin
		.from("company_profiles")
		.upsert({
			profile_id: user.id,
			logo_url: logoUrl || null,
			description: description || null,
			established_year: establishedYear,
			employee_count: employeeCount || null,
			website_url: websiteUrl || null,
			certifications: certifications ?? [],
			categories: categories ?? [],
			updated_at: new Date().toISOString(),
		}, { onConflict: "profile_id" });

	if (profileError) {
		console.error("profileError:", profileError);
		return NextResponse.json({ error: profileError.message }, { status: 500 });
	}

	const existingIds = products
		.filter((p: { id: string | null }) => p.id !== null)
		.map((p: { id: string }) => p.id);

	if (existingIds.length > 0) {
		await admin
			.from("products")
			.delete()
			.eq("profile_id", user.id)
			.not("id", "in", `(${existingIds.join(",")})`);
	} else {
		await admin.from("products").delete().eq("profile_id", user.id);
	}

	for (const product of products) {
		if (product.id) {
			await admin
				.from("products")
				.update({
					name: product.name,
					description: product.description || null,
					image_urls: product.imageUrls ?? [],
					price_range: product.priceRange || null,
					sort_order: product.sortOrder,
				})
				.eq("id", product.id);
		} else {
			await admin.from("products").insert({
				profile_id: user.id,
				name: product.name,
				description: product.description || null,
				image_urls: product.imageUrls ?? [],
				price_range: product.priceRange || null,
				sort_order: product.sortOrder,
			});
		}
	}

	return NextResponse.json({ success: true });
}