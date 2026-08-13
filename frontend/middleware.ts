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

	const isProtectedPath =
		pathname.startsWith("/buyer") ||
		pathname.startsWith("/seller") ||
		pathname.startsWith("/support") ||
		pathname.startsWith("/admin");

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
	const HOME_BY_ROLE: Record<string, string> = {
		admin: "/admin",
		seller: "/seller/dashboard",
		buyer: "/buyer/dashboard",
	};
	const homePath = HOME_BY_ROLE[role] ?? "/buyer/dashboard";

	if (pathname === "/login") {
		return NextResponse.redirect(new URL(homePath, request.url));
	}

	// 운영자 화면은 운영자만. 나머지는 자기 역할의 홈으로 돌려보낸다.
	if (pathname.startsWith("/admin") && role !== "admin") {
		return NextResponse.redirect(new URL(homePath, request.url));
	}

	// 운영자는 거래 화면을 쓰지 않는다. 소속 회사가 없어 데이터가 비어 보인다.
	if (role === "admin" && (pathname.startsWith("/buyer") || pathname.startsWith("/seller"))) {
		return NextResponse.redirect(new URL("/admin", request.url));
	}

	if (role === "buyer" && pathname.startsWith("/seller")) {
		return NextResponse.redirect(new URL("/buyer/dashboard", request.url));
	}

	if (role === "seller" && pathname.startsWith("/buyer")) {
		return NextResponse.redirect(new URL("/seller/dashboard", request.url));
	}

	// 이미 검증한 user/role을 헤더로 전달해 서버 컴포넌트에서 재조회하지 않게 한다.
	request.headers.set("x-user-id", user.id);
	request.headers.set("x-user-email", user.email ?? "");
	request.headers.set("x-user-role", role);

	const responseWithHeaders = NextResponse.next({ request });
	supabaseResponse.cookies.getAll().forEach((cookie) => responseWithHeaders.cookies.set(cookie));

	return responseWithHeaders;
}

export const config = {
	matcher: ["/buyer/:path*", "/seller/:path*", "/support/:path*", "/admin/:path*", "/login"],
};