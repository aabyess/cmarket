import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 인증이 필요한 라우트 그룹. matcher는 헤더 위조 방지를 위해 일부러 훨씬 넓게 잡았으므로,
// 새 보호 라우트를 추가할 때는 여기만 갱신하면 된다(matcher를 건드릴 필요 없음).
const PROTECTED_PREFIXES = ["/buyer", "/seller", "/support", "/admin"];

export async function middleware(request: NextRequest) {
	// 클라이언트가 보낸 x-user-* 헤더는 위조일 수 있으니 항상 제거한다.
	// 아래에서 미들웨어가 직접 검증한 값만 다시 세팅한다.
	request.headers.delete("x-user-id");
	request.headers.delete("x-user-email");
	request.headers.delete("x-user-role");

	const { pathname } = request.nextUrl;
	const isProtectedPath = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
	const isAuthRelevant = isProtectedPath || pathname === "/login";

	// 인증과 무관한 공개 경로는 위조 헤더 제거만 하고 바로 통과시킨다.
	if (!isAuthRelevant) {
		return NextResponse.next({ request });
	}

	const pendingCookies: { name: string; value: string; options: CookieOptions }[] = [];

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
					pendingCookies.push(...cookiesToSet);
				},
			},
		},
	);

	function buildResponse(): NextResponse {
		const response = NextResponse.next({ request });
		pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
		return response;
	}

	const { data: { user } } = await supabase.auth.getUser();

	if (!user && isProtectedPath) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	if (!user) {
		return buildResponse();
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
	try {
		request.headers.set("x-user-email", user.email ?? "");
	} catch (err) {
		// 이메일 값에 헤더로 쓸 수 없는 문자가 섞여 있으면 헤더 없이 진행한다.
		console.error("Failed to set x-user-email header", err);
	}
	request.headers.set("x-user-role", role);

	return buildResponse();
}

// 정적 자산/API를 뺀 전체 경로를 매칭한다. 좁혔다가 새 공개 라우트가 빠지면
// 그 경로에서 헤더 위조 검사를 건너뛰게 되므로, 보호 경로가 아닌 요청은
// 위에서 헤더 삭제만 하고 즉시 반환해 비용을 최소화한다.
export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
