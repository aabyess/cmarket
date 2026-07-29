# Trading App — Claude Project Instructions

Behavioral guidelines + project-specific conventions. Both sections apply at all times.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

---

## PART 1 — Behavioral Guidelines

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan before starting:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

---

## PART 2 — Project Conventions

### Project Overview
한국-인도네시아 B2B 트레이딩 플랫폼 (C-Market Korea-Indonesia)
- 발주자(Buyer): 공고 등록, 낙찰자 선정
- 공급자(Seller): 견적 제출, 납품 관리
- 주요 품목: 사무용품, 연구장비, 산업기계, 화학약품

### Stack (versions are fixed — do not deviate)

| Category | Library | Version |
|----------|---------|---------|
| Framework | Next.js | 15.5.12 |
| Language | TypeScript | ^5 |
| CSS | Tailwind CSS | ^4 |
| Database | Supabase | latest |
| Realtime | Supabase Realtime | latest |
| Auth | Supabase Auth | latest |
| Client state | Zustand | ^5.0.11 |
| Server state | @tanstack/react-query | ^5.90.21 |
| Animation | motion | ^12.35.1 |
| UI primitives | @headlessui/react | ^2.2.9 |
| Package manager | pnpm | (never npm or yarn) |
| Deploy | Vercel | |
| Lint/format | ESLint ^9 + Prettier ^3.8.1 | |
| Style utils | clsx ^2.1.1 + cva ^0.7.1 + tailwind-merge ^3.5.0 | |
| Misc | react-loading-skeleton ^3.5.0 | |

### Folder Structure

```
app/
  (auth)/           ← auth pages group
    login/
    signup/
  (main)/           ← service pages group — subfolders: kebab-case
    buyer/
      dashboard/
      post-listing/
      order-list/
    seller/
      dashboard/
      quote-submit/
  layout.tsx
  page.tsx

components/
  ui/               ← atomic UI: Button, Input, Badge, Modal ...
  commons/          ← domain-agnostic reusable components
  layout/           ← Header, Sidebar, Footer

features/           ← subfolders: camelCase
  shared/
    components/     ← domain components shared across multiple features
  <camelCase>/
    components/
    apis.ts
    queries.ts
    mutations.ts
    hooks.ts
    types.ts
    utils.ts

libs/               ← library config: queryClient, supabase, msw ...
utils/              ← shared utility functions
hooks/              ← shared custom hooks
store/              ← Zustand stores only
types/              ← global shared types
constants/          ← global constants
```

### Naming Rules

| Target | Rule | Example |
|--------|------|---------|
| `app/` subfolders | kebab-case | `my-portfolio/`, `order-history/` |
| `features/` subfolders | camelCase | `orderBook/`, `tradeHistory/` |
| Component files | PascalCase | `OrderBook.tsx`, `PriceTag.tsx` |
| Hook files | camelCase + `use` prefix | `useOrderBook.ts` |
| Util / api / type files | camelCase | `apis.ts`, `formatPrice.ts` |
| Zustand stores | camelCase + `use` prefix | `useMarketStore.ts` |
| Variables | camelCase | `orderList`, `userName` |
| Constants | UPPER_SNAKE_CASE | `MAX_ORDER_COUNT` |
| Handler functions | `handle` prefix | `handleButtonClick`, `handleNameChange` |
| API functions | method prefix | `getOrderList`, `postOrder`, `updateOrder`, `deleteOrder` |
| Boolean values | `is` or `has` prefix | `isLoading`, `hasError` |
| Image files | `ic` for icons, `img` for images | `icArrow.svg`, `imgBanner.png` |

### Component Splitting Rule

Place sub-components as sibling files inside the parent folder. Never create nested subfolders.
File names: PascalCase, prefixed with the parent component name.

```
# Correct
OrderBook/
  index.tsx           ← entry point
  OrderBookAsk.tsx    ← sub-component (parent prefix + PascalCase)
  OrderBookBid.tsx
  OrderBookSpread.tsx
  index.stories.tsx

# Forbidden
OrderBook/
  index.tsx
  sub/
    Ask.tsx           ← nested folder forbidden
```

Always generate `index.tsx` + `index.stories.tsx` together.

### Function Declaration Rule

All functions must use function declarations, not arrow functions.

```ts
// Correct
function OrderBook({ symbol }: OrderBookProps): JSX.Element { ... }

// Forbidden
const OrderBook = ({ symbol }: OrderBookProps) => { ... }
```

### Style Rules

Use `cn()` for all class merging (clsx + tailwind-merge).
Use `cva` for variants. Inline ternary class switching is forbidden.

```ts
// Correct
const button = cva('rounded font-medium', {
  variants: {
    intent: {
      buy:  'bg-blue-600 text-white hover:bg-blue-700',
      sell: 'bg-orange-500 text-white hover:bg-orange-600',
    },
  },
  defaultVariants: { intent: 'buy' },
})

// Forbidden
className={`btn ${isBuy ? 'bg-blue-500' : 'bg-orange-500'}`}
```

Tailwind v4: define custom tokens in `globals.css` via `@theme {}`. Do not use `tailwind.config.ts`. Minimize `@apply`.

### Prettier Rules

```js
{
  arrowParens: "always",
  bracketSameLine: true,
  bracketSpacing: true,
  trailingComma: "all",
  singleQuote: false,      // 큰따옴표 사용
  semi: true,              // 세미콜론 사용
  useTabs: true,           // 탭 사용
  tabWidth: 2,
  printWidth: 100,
  endOfLine: "auto",
  plugins: ["prettier-plugin-tailwindcss"]
}
```

### Git Flow Strategy

```
main      ← 배포 브랜치 (직접 push 금지)
develop   ← 개발 통합 브랜치
feat/xxx  ← 기능별 작업 브랜치
fix/xxx   ← 버그 수정 브랜치
```

Branch naming:
```
feat/dashboard
feat/post-listing
feat/order-list
fix/login-bug
```

### State Management Rules

**Server state — TanStack Query v5**
- All server data goes through TanStack Query. No exceptions.
- Query keys defined as constants in `features/<name>/queries.ts`.
- Mutations in `mutations.ts`.
- Use v5 API only: `useQuery({ queryKey, queryFn })` — no v4 patterns.

**Client state — Zustand v5**
- Only for global UI state and session. Never for server data.
- Stores live in `store/` only. No async fetch logic inside stores.
- Import: `import { create } from 'zustand'`

**Supabase Realtime**
- 채팅, 실시간 가격 변동 등 실시간 기능은 Supabase Realtime 사용
- 보안 키는 절대 클라이언트에 노출 금지
- RLS(Row Level Security) 반드시 설정

### TypeScript Rules

- `any` is forbidden. Use `unknown` + type guard if unavoidable.
- Prefer `type` over `interface`. Use `interface` only for explicit extension.
- Props type name = component name + `Props` (e.g. `OrderBookProps`).
- All functions must have explicit return types.

```ts
// Correct
type OrderBookProps = { symbol: string; depth?: number }
function OrderBook({ symbol, depth = 10 }: OrderBookProps): JSX.Element { ... }

// Forbidden
function OrderBook({ symbol }: any) { ... }
```

### Import Path Rules

Always use absolute alias paths. Relative paths 3+ levels deep are forbidden.

```ts
// Correct
import { Button }         from '@/components/ui/Button'
import { useOrderBook }   from '@/features/orderBook/hooks'
import { formatPrice }    from '@/utils/formatPrice'

// Forbidden
import { Button } from '../../../components/ui/Button'
```

### Version-specific API Rules

| Library | Rule |
|---------|------|
| Next.js 15 | Always mark `'use client'` / `'use server'`. Prefer async server components. SEO 위해 서버 컴포넌트 우선 사용. |
| TanStack Query v5 | `useQuery({ queryKey, queryFn })` only. No v4 callback options. |
| Zustand v5 | `import { create } from 'zustand'` |
| motion v12 | `import { motion } from 'motion/react'` |
| Tailwind v4 | `@theme {}` in globals.css. No `tailwind.config.ts`. |

### Code Generation Rules

1. Always add file path as a comment on line 1.
   ```ts
   // features/orderBook/components/OrderBook/index.tsx
   ```
2. Generate `index.tsx` + `index.stories.tsx` as a set.
3. Never use plain `number` arithmetic for financial values — use `decimal.js`.
4. If a new package is needed, name it first and provide `pnpm add` command.
5. If a change may conflict with existing code, ask before writing.