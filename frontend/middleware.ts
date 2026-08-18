import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

// splitLocale/withLocale은 "기본 로케일(ko)은 URL에 접두사가 없다"는 as-needed 전제로
// 짜여 있다. routing.localePrefix가 바뀌면 이 파일도 같이 고쳐야 하므로, 조용히
// 어긋나는 대신 여기서 바로 터뜨린다.
if (routing.localePrefix !== "as-needed") {
	throw new Error(
		"middleware.ts의 splitLocale/withLocale은 localePrefix: 'as-needed' 전제로 작성됨. " +
			"routing.localePrefix가 바뀌었으면 이 로직도 같이 수정해야 한다.",
	);
}

// URL에 접두사가 붙는 비기본 로케일.
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

function isRedirect(response: NextResponse): boolean {
	return response.headers.has("location");
}

// 인증이 필요한 라우트 그룹. matcher는 헤더 위조 방지를 위해 일부러 훨씬 넓게 잡았으므로,
// 새 보호 라우트를 추가할 때는 여기만 갱신하면 된다(matcher를 건드릴 필요 없음).
const PROTECTED_PREFIXES = ["/buyer", "/seller", "/support", "/admin", "/plans"];

export async function middleware(request: NextRequest) {
	// 클라이언트가 보낸 x-user-* 헤더는 위조일 수 있으니 항상 제거한다.
	// 아래에서 미들웨어가 직접 검증한 값만 다시 세팅한다.
	request.headers.delete("x-user-id");
	request.headers.delete("x-user-email");
	request.headers.delete("x-user-role");

	// next-intl이 쿠키(NEXT_LOCALE)/Accept-Language 기준으로 URL에 locale 접두사를
	// 새로 붙이려는 리다이렉트라면 먼저 통과시킨다. 여기서 먼저 걸러야, 아래 인증
	// 로직이 URL만 보고 판단한 locale로 리다이렉트를 만들다가 next-intl의 리다이렉트와
	// 충돌해 이중 리다이렉트(엉뚱한 언어로 갔다가 다시 튀는 현상)가 생기지 않는다.
	// 리다이렉트가 아니면 이 결과는 버린다 — NextResponse.next()는 생성 시점의
	// request.headers를 스냅샷하므로, 아래에서 x-user-* 헤더를 세팅한 뒤
	// buildResponse()가 다시 만들어야 그 헤더가 최종 응답에 반영된다.
	const precheckResponse = handleI18nRouting(request);
	if (isRedirect(precheckResponse)) return precheckResponse;

	const { locale, pathWithoutLocale } = splitLocale(request.nextUrl.pathname);
	const isProtectedPath = PROTECTED_PREFIXES.some((prefix) => pathWithoutLocale.startsWith(prefix));
	const isAuthRelevant = isProtectedPath || pathWithoutLocale === "/login";

	// 인증과 무관한 공개 경로는 언어 라우팅 결과를 그대로 반환한다.
	if (!isAuthRelevant) {
		return precheckResponse;
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
// ".*\\..*"로 확장자 있는 경로(public/의 이미지·폰트 등 정적 파일)를 제외해야 한다 —
// 이게 빠지면 /images/foo.png 같은 요청도 next-intl 라우팅을 타면서 정적 파일 서빙이 깨진다.
export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|.*\\..*).*)"],
};
