import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
	let supabaseResponse = NextResponse.next({ request });

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
					supabaseResponse = NextResponse.next({ request });
					cookiesToSet.forEach(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options),
					);
				},
			},
		},
	);

	const { data: { user } } = await supabase.auth.getUser();
	const { pathname } = request.nextUrl;

	const isProtectedPath = pathname.startsWith("/buyer") || pathname.startsWith("/seller");

	if (!user && isProtectedPath) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	if (!user) {
		return supabaseResponse;
	}

	const { data: profile } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", user.id)
		.single();

	const role = profile?.role ?? "buyer";
	const homePath = role === "seller" ? "/seller/dashboard" : "/buyer/dashboard";

	if (pathname === "/login") {
		return NextResponse.redirect(new URL(homePath, request.url));
	}

	if (role === "buyer" && pathname.startsWith("/seller")) {
		return NextResponse.redirect(new URL("/buyer/dashboard", request.url));
	}

	if (role === "seller" && pathname.startsWith("/buyer")) {
		return NextResponse.redirect(new URL("/seller/dashboard", request.url));
	}

	return supabaseResponse;
}

export const config = {
	matcher: ["/buyer/:path*", "/seller/:path*", "/login"],
};