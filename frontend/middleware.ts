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

	// 로그인 안 한 유저가 보호된 페이지 접근 시 로그인으로 리다이렉트
	if (!user && pathname.startsWith("/buyer")) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	// 로그인한 유저가 로그인 페이지 접근 시 대시보드로 리다이렉트
	if (user && pathname === "/login") {
		return NextResponse.redirect(new URL("/buyer/dashboard", request.url));
	}

	return supabaseResponse;
}

export const config = {
	matcher: ["/buyer/:path*", "/login"],
};