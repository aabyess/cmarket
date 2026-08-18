# C-Market 프론트엔드 — 컨벤션 & 설정값 정리

실제 설정 파일(`tsconfig.json`, `eslint.config.mjs`, `prettier.config.js`, `next.config.ts`, `app/globals.css`, `package.json`)을 직접 읽어 정리한 스냅샷입니다. 정책/규칙은 `CLAUDE.md`가 원본이며, 이 문서는 "실제 값이 뭔지" 빠르게 찾아보는 참고용입니다.

- 정리일: 2026-08-14
- 확인 브랜치: `fix/ux-audit-critical` (main 기준 최신)

---

## 1. 스택 & 버전 (package.json 기준 실제 설치 버전)

| 구분 | 라이브러리 | 버전 |
|---|---|---|
| 프레임워크 | Next.js | 15.5.12 (turbopack) |
| 언어 | TypeScript | ^5 |
| React | react / react-dom | 19.1.0 |
| CSS | Tailwind CSS | ^4 |
| DB/Auth/Realtime | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) | ^0.12.3 / ^2.110.8 |
| 클라이언트 상태 | Zustand | ^5.0.14 |
| 서버 상태 | @tanstack/react-query | ^5.101.4 |
| 애니메이션 | motion | ^12.42.2 |
| UI 프리미티브 | @headlessui/react, @base-ui/react | ^2.2.10 / ^1.6.0 |
| 국제화 | next-intl | ^4.13.6 *(진행 중 — 아래 9절 참고)* |
| 스타일 유틸 | clsx / cva / tailwind-merge | ^2.1.1 / ^0.7.1 / ^3.6.0 |
| 리치 에디터 | @tiptap/* | ^3.29.2 (지연 로딩 적용됨) |
| 애니메이션(Lottie) | lottie-react | ^2.4.1 (지연 로딩 적용됨) |
| PDF | @react-pdf/renderer, pdfjs-dist | ^4.5.1 / ^6.2.108 |
| 금액 연산 | decimal.js | ^10.6.0 |
| 아이콘 | lucide-react | ^1.27.0 |
| 지도 | @react-google-maps/api | ^2.20.8 |
| 로딩 스켈레톤 | react-loading-skeleton | ^3.5.0 |
| 패키지 매니저 | pnpm | (npm/yarn 금지) |
| 린트/포맷 | ESLint ^9, Prettier ^3.9.6 | |
| 번들 분석 | @next/bundle-analyzer | ^15.5.12 (`ANALYZE=true`일 때만) |
| 테스트/스토리 | Storybook ^10.5.5, Vitest ^4.1.10, Playwright ^1.62.0 | |

### npm scripts (`package.json`)

```
dev             next dev --turbopack
build           next build --turbopack
analyze         ANALYZE=true next build   # webpack 분석기, turbopack 미사용
start           next start
lint            eslint
storybook       storybook dev -p 6006
build-storybook storybook build
```

---

## 2. TypeScript (`tsconfig.json`)

- `target: ES2017`, `strict: true`, `module/moduleResolution: esnext/bundler`
- `noEmit: true` — 타입체크는 `tsc --noEmit`으로

**경로 별칭 (실제 등록된 것만)**

```
@/*            → ./*
@/components/* → ./components/*
@/features/*   → ./features/*
@/libs/*       → ./libs/*
@/utils/*      → ./utils/*
@/hooks/*      → ./hooks/*
@/store/*      → ./store/*
@/types/*      → ./types/*
@/constants/*  → ./constants/*
```

CLAUDE.md의 "상대경로 3단계 이상 금지" 규칙은 이 별칭들로 지키면 됨.

---

## 3. ESLint (`eslint.config.mjs`)

Flat config, `FlatCompat`로 레거시 extends 사용:

```js
extends: ["next/core-web-vitals", "next/typescript", "prettier"]
+ eslint-plugin-storybook (flat/recommended)
```

- `prettier` extends가 마지막에 있어 포맷 관련 규칙은 ESLint가 아니라 Prettier가 전담(충돌 규칙 비활성화).
- 프로젝트 자체 커스텀 규칙(no-explicit-any 강제 등)은 ESLint 레벨에는 없음 — CLAUDE.md의 `any` 금지 규칙은 **린트로 강제되지 않고 코드 리뷰/컨벤션으로만 지켜지는 상태**라는 뜻이니 참고.

---

## 4. Prettier (`prettier.config.js`)

```js
{
  arrowParens: "always",
  bracketSameLine: true,
  bracketSpacing: true,
  trailingComma: "all",
  singleQuote: false,     // 큰따옴표
  semi: true,
  useTabs: true,           // 탭 사용
  tabWidth: 2,
  printWidth: 100,
  endOfLine: "auto",
  plugins: ["prettier-plugin-tailwindcss"],  // 클래스 자동 정렬
}
```

CLAUDE.md에 적힌 값과 실제 파일이 100% 일치합니다.

---

## 5. Next.js 설정 (`next.config.ts`)

```ts
export default withNextIntl(withBundleAnalyzer(nextConfig));
```

- `images.remotePatterns` — 하드코딩이 아니라 `constants/images.ts`의 `ALLOWED_IMAGE_HOSTS` 배열을 매핑해서 생성. **새 이미지 호스트를 쓰려면 여기 배열에 추가해야 함.**
- `turbopack.root` — 모노레포/상위 폴더 혼동 방지용으로 프로젝트 루트를 명시적으로 고정.
- 허용 안 된 호스트의 이미지는 `next/image`가 렌더링 시점에 크래시하므로, `components/commons/SafeImage`가 허용 목록 밖일 때 자동으로 `<img>`로 우회함 (`ALLOWED_IMAGE_HOSTS` 미등록 호스트를 다루는 곳은 이 컴포넌트를 쓸 것).
- `withBundleAnalyzer`는 `ANALYZE=true`일 때만 동작, turbopack 대신 webpack으로 빌드됨(`pnpm analyze`).

---

## 6. 디자인 토큰 (`app/globals.css`, Tailwind v4 `@theme inline`)

Tailwind v4 방식대로 `tailwind.config.ts` 없이 CSS에서 토큰을 정의. 실제 값:

**Radius** — `--radius: 0.75rem` 기준으로 sm~4xl까지 배율(0.6~2.6배)로 파생.

**Font size** — Tailwind 기본값보다 한 단계씩 큼(예: `text-base` = 1.0625rem).

**색상 — shadcn 계열 토큰** (`--color-*`→ CSS 변수 매핑): `background/foreground/card/popover/primary/secondary/muted/accent/destructive/border/input/ring`, `chart-1~5`, `sidebar-*`

**색상 — iMessage 계열 커스텀 토큰** (앱 고유 브랜드 톤):
```
--imsg-blue:      #2563EB   (예전 #3B82F6에서 리브랜딩됨 — 주석으로 남아있음)
--imsg-gray:      #E9E9EB
--imsg-surface:   #F2F2F7
--imsg-secondary: #8E8E93
```

**참고**: `--primary`, `--ring`, `--chart-1`, `--sidebar-primary`, `--imsg-blue` 전부 `#2563EB`가 실제 정답 primary 값입니다. 코드베이스 곳곳에 남아있는 `#3B82F6` 하드코딩은 리브랜딩 이전 값이 청산되지 않은 것이니, 새 코드를 쓸 때 `#3B82F6`을 그대로 복붙하지 않도록 주의(관련 상세는 `docs/ux-audit-2026-08-14.md` C3 참고).

**다크모드**: `.dark` 클래스 기반 shadcn 기본 팔레트(oklch)가 정의는 되어 있으나, 앱 어디서도 `.dark` 클래스를 토글하는 코드가 확인되지 않음 — 현재는 사실상 미사용 상태로 보임(정의만 있고 스위치 없음).

**success/warning**: `:root`에 `--success:#22c55e`, `--warning:#f59e0b` 변수는 있지만 `@theme inline`에 `--color-success`/`--color-warning` 매핑이 빠져 있어 `bg-success`/`text-warning` 같은 Tailwind 유틸리티 클래스는 **실제로 생성되지 않습니다.** 성공/경고 색을 쓰려면 지금은 인라인 hex를 쓸 수밖에 없는 상태 — 근본적으로는 `@theme inline`에 매핑을 추가하는 게 맞음.

---

## 7. 폴더 구조 & 네이밍 (CLAUDE.md 기준, 실제 구조로 검증됨)

```
app/(auth)/            로그인, 회원가입 — kebab-case
app/(main)/buyer/...   구매자 화면
app/(main)/seller/...  공급자 화면
app/admin/             관리자
components/ui/         원자적 UI (Button, Modal ...)
components/commons/    도메인 무관 재사용 컴포넌트 (PageLoading, Pagination, SafeImage)
components/layout/     Header/Sidebar/Footer
features/<camelCase>/  buyer, seller, auth, chat, contract, notifications, shared, siteBuilder, support
  ├─ components/
  ├─ apis.ts / serverApis.ts
  ├─ queries.ts / mutations.ts
  ├─ hooks.ts
  ├─ types.ts
  └─ utils.ts
libs/       supabase, queryClient 등 라이브러리 설정
utils/      전역 유틸 함수
hooks/      전역 커스텀 훅
store/      Zustand 스토어만
types/      전역 공유 타입
constants/  전역 상수 (예: ALLOWED_IMAGE_HOSTS)
```

**네이밍 규칙 요약**

| 대상 | 규칙 | 예시 |
|---|---|---|
| `app/` 하위 폴더 | kebab-case | `post-listing/` |
| `features/` 하위 폴더 | camelCase | `orderBook/` |
| 컴포넌트 파일 | PascalCase | `OrderBook.tsx` |
| 훅 파일 | camelCase + `use` | `useOrderBook.ts` |
| API 함수 | `get/post/update/delete` 접두사 | `getOrderList` |
| 핸들러 함수 | `handle` 접두사 | `handleButtonClick` |
| Boolean | `is`/`has` 접두사 | `isLoading` |
| 상수 | UPPER_SNAKE_CASE | `MAX_ORDER_COUNT` |
| Zustand 스토어 | camelCase + `use` | `useMarketStore.ts` |

**컴포넌트 분리 규칙**: 하위 컴포넌트는 `ParentName/` 폴더 안에 형제 파일로 (중첩 폴더 금지), 파일명은 부모명 접두사 + PascalCase. `index.tsx` + `index.stories.tsx`는 항상 세트로 생성.

---

## 8. 코드 스타일 하드 룰 (CLAUDE.md 명시, 실제 코드베이스 준수도는 편차 있음)

- **함수 선언**: 화살표 함수 대신 `function` 선언 사용 (컴포넌트 포함)
- **타입**: `interface`보다 `type` 우선, `any` 금지(`unknown`+타입가드), 모든 함수에 명시적 반환 타입, Props 타입명 = `컴포넌트명 + Props`
- **클래스 병합**: `cn()`(clsx+tailwind-merge) 사용, variant는 `cva`로만 — 인라인 삼항 클래스 분기 금지
- **금액 연산**: 순수 `number` 연산 금지, `decimal.js` 사용
- **파일 헤더**: 코드 생성 시 1번째 줄에 파일 경로 주석 (`// features/orderBook/.../index.tsx`)
- **State**: 서버 상태는 TanStack Query v5(`useQuery({queryKey, queryFn})`)만, 클라이언트/세션 전역 상태만 Zustand v5, 스토어에 비동기 fetch 로직 금지

> 참고: `docs/ux-audit-2026-08-14.md`에서 확인된 것처럼 위 하드 룰 중 상당수(특히 cva 사용, 하드코딩 색상 금지)가 실제 코드에서는 부분적으로만 지켜지고 있습니다. "규칙은 이거다"와 "실제로 이렇다"는 다를 수 있다는 점을 참고해 주세요.

---

## 9. Git / 브랜치

```
main      배포 브랜치, 직접 push 금지
develop   개발 통합 브랜치
feat/xxx  기능 브랜치
fix/xxx   버그 수정 브랜치
```

**현재 살아있는 브랜치** (2026-08-14 기준):
`main`, `develop`, `feat-ui`, `feat/buyer-seller-dashboard-data`, `feat/i18n-multilang`, `feat/performance-improvement`, `fix/ux-audit-critical`

**참고 — 진행 중인 대형 작업**: `next-intl` 기반 다국어 인프라 작업이 진행 중이며, 라우트가 `app/(auth)/...` → `app/[locale]/(auth)/...` 형태로 이동하는 구조 변경이 함께 일어나고 있습니다. 이 문서의 폴더 구조(7절)는 `[locale]` 세그먼트가 안정화되기 전 기준이니, i18n 작업이 머지된 뒤에는 실제 경로가 한 단계 더 깊어진다는 점을 감안해 주세요.
