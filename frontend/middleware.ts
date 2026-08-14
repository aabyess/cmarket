import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

// URL에 접두사가 붙는 비기본 로케일. 기본 로케일(ko)은 접두사가 없다("as-needed").
const PREFIXED_LOCALES = routing.locales.filter((locale) => locale !== routing.defaultLocale);

function splitLocale(pathname: string): { locale: string; pathWithoutLocale: string } {
	for (const locale of PREFIXED_LOCALES) {
		if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
			return { locale, pathWithoutLocale: pathname.slice(locale.length + 1) || "/" };
		}
	}
	return { locale: routing.defaultLocale, pathWithoutLocale: pathname };
}

function withLocale(locale: string, path: string): string {
	return locale === routing.defaultLocale ? path : `/${locale}${path}`;
}

// 인증이 필요한 라우트 그룹. matcher는 헤더 위조 방지를 위해 일부러 훨씬 넓게 잡았으므로,
// 새 보호 라우트를 추가할 때는 여기만 갱신하면 된다(matcher를 건드릴 필요 없음).
const PROTECTED_PREFIXES = ["/buyer", "/seller", "/support", "/admin"];

export async function middleware(request: NextRequest) {
	// 클라이언트가 보낸 x-user-* 헤더는 위조일 수 있으니 항상 제거한다.
	// 아래에서 미들웨어가 직접 검증한 값만 다시 세팅한다.
	request.headers.delete("x-user-id");
	request.headers.delete("x-user-email");
	request.headers.delete("x-user-role");

	const { locale, pathWithoutLocale } = splitLocale(request.nextUrl.pathname);
	const isProtectedPath = PROTECTED_PREFIXES.some((prefix) => pathWithoutLocale.startsWith(prefix));
	const isAuthRelevant = isProtectedPath || pathWithoutLocale === "/login";

	// 인증과 무관한 공개 경로는 위조 헤더 제거 후 언어 라우팅만 하고 바로 통과시킨다.
	if (!isAuthRelevant) {
		return handleI18nRouting(request);
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
		const response = handleI18nRouting(request);
		pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
		return response;
	}

	const { data: { user } } = await supabase.auth.getUser();

	if (!user && isProtectedPath) {
		return NextResponse.redirect(new URL(withLocale(locale, "/login"), request.url));
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

	if (pathWithoutLocale === "/login") {
		return NextResponse.redirect(new URL(withLocale(locale, homePath), request.url));
	}

	// 운영자 화면은 운영자만. 나머지는 자기 역할의 홈으로 돌려보낸다.
	if (pathWithoutLocale.startsWith("/admin") && role !== "admin") {
		return NextResponse.redirect(new URL(withLocale(locale, homePath), request.url));
	}

	// 운영자는 거래 화면을 쓰지 않는다. 소속 회사가 없어 데이터가 비어 보인다.
	if (role === "admin" && (pathWithoutLocale.startsWith("/buyer") || pathWithoutLocale.startsWith("/seller"))) {
		return NextResponse.redirect(new URL(withLocale(locale, "/admin"), request.url));
	}

	if (role === "buyer" && pathWithoutLocale.startsWith("/seller")) {
		return NextResponse.redirect(new URL(withLocale(locale, "/buyer/dashboard"), request.url));
	}

	if (role === "seller" && pathWithoutLocale.startsWith("/buyer")) {
		return NextResponse.redirect(new URL(withLocale(locale, "/seller/dashboard"), request.url));
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
// 그 경로에서 헤더 위조 검사와 언어 라우팅을 건너뛰게 된다.
export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
