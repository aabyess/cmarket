# K-NUSA — Korea × Indonesia B2B Marketplace

> 인도네시아 발주기관(Buyer)과 한국 공급기업(Seller)을 연결하는 단방향 B2B 조달 플랫폼

---

## 📌 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 플랫폼명 | K-NUSA |
| 서비스 형태 | B2B 웹 플랫폼 |
| 거래 구조 | 단방향 (인도네시아 Buyer → 한국 Seller) |
| 주요 품목 | 사무용품, 연구장비, 산업기계, 화학약품 |
| 배포 환경 | Vercel + Supabase (Singapore) |

---

## 🛠 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js | 15.5 |
| 언어 | TypeScript | 5 |
| 스타일 | Tailwind CSS | v4 |
| DB | Supabase (PostgreSQL) | latest |
| 인증 | Supabase Auth | latest |
| 실시간 | Supabase Realtime | latest |
| 파일 | Supabase Storage | latest |
| 서버 상태 | TanStack Query | v5 |
| 전역 상태 | Zustand | v5 |
| 애니메이션 | motion | v12 |
| 패키지 매니저 | pnpm | - |
| 배포 | Vercel | - |

---

## 🏗 시스템 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                   Client Browser                     │
│         (인도네시아 Buyer / 한국 Seller)               │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────┐
│              Next.js 15 (Vercel)                     │
│                                                      │
│  ┌─────────────────┐    ┌──────────────────────┐    │
│  │  App Router     │    │   API Routes          │    │
│  │  (페이지 렌더링) │    │  (서버사이드 로직)    │    │
│  │                 │    │  app/api/**           │    │
│  │  Server Component│   │                      │    │
│  │  Client Component│   │  - 인증 처리          │    │
│  │  Middleware      │   │  - 비즈니스 로직      │    │
│  └─────────────────┘    │  - 외부 API 연동      │    │
│                         └──────────────────────┘    │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│                   Supabase                           │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌─────────┐  ┌──────┐ │
│  │PostgreSQL│  │   Auth   │  │Realtime │  │Storage│ │
│  │  (DB)    │  │ (인증)   │  │(실시간) │  │(파일) │ │
│  └──────────┘  └──────────┘  └─────────┘  └──────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 📁 폴더 구조

```
frontend/
├── app/
│   ├── (auth)/                       # 인증 페이지 그룹
│   │   ├── login/                    # 로그인
│   │   └── signup/                   # 회원가입
│   │       ├── page.tsx              # 1단계: 국적 선택
│   │       ├── terms/page.tsx        # 2단계: 약관 동의
│   │       ├── info/page.tsx         # 3단계: 기업정보 입력
│   │       └── complete/page.tsx     # 4단계: 가입 완료
│   │
│   ├── (main)/                       # 서비스 페이지 그룹
│   │   ├── layout.tsx                # 공통 레이아웃 (Sidebar + Header)
│   │   ├── buyer/                    # 발주기관 전용
│   │   │   ├── dashboard/            # 대시보드
│   │   │   ├── post-listing/         # 공고 등록
│   │   │   ├── order-list/           # 공고 목록
│   │   │   ├── quote-review/         # 견적 검토 / 낙찰 선정
│   │   │   └── contract/             # 계약 관리
│   │   ├── seller/                   # 공급기업 전용
│   │   │   ├── dashboard/            # 대시보드
│   │   │   ├── listing-browse/       # 공고 탐색
│   │   │   ├── quote-submit/         # 견적 제출
│   │   │   ├── contract/             # 계약 관리
│   │   │   └── profile/edit/         # 내 프로필 편집
│   │   └── companies/
│   │       └── [id]/                 # Seller 기업 프로필 (공개)
│   │
│   └── api/                          # API Routes
│       ├── auth/
│       │   ├── check-username/       # 아이디 중복 확인
│       │   └── signup/               # 회원가입 처리
│       ├── listings/                 # 공고 CRUD
│       ├── quotes/                   # 견적 CRUD
│       ├── contracts/                # 계약 관리
│       ├── messages/                 # 채팅
│       ├── companies/                # 기업 프로필 CRUD
│       └── uploads/                  # 파일 업로드
│
├── features/                         # 도메인별 비즈니스 로직
│   ├── auth/
│   ├── buyer/
│   ├── seller/
│   └── shared/
│
├── components/
│   ├── ui/                           # 원자 단위 UI
│   ├── commons/                      # 재사용 컴포넌트
│   └── layout/                       # Sidebar, Header
│
├── store/                            # Zustand 전역 상태
├── libs/                             # 외부 라이브러리 설정
├── utils/                            # 공통 유틸 함수
├── hooks/                            # 공통 커스텀 훅
├── types/                            # 전역 타입 정의
└── constants/                        # 전역 상수
```

---

## 🗄 DB 설계

### ERD

```
auth.users (Supabase 기본)
    │
    ▼
profiles ─────────────── companies ─────── company_profiles
    │                        │                    │
    │                   [인도네시아]           description
    │                   npwp, nib             logo_url
    │                   provinsi, city        products[]
    │                        │
    │                   [한국]
    │                   business_number
    │                   address
    │
    ├── listings (Buyer 등록)
    │       │
    │       └── quotes (Seller 제출)
    │               │
    │               └── contracts (낙찰 후 생성)
    │                       │
    │                       ├── messages (채팅)
    │                       └── documents (서류)
    │
    └── documents (가입 서류)
```

### 주요 테이블

| 테이블 | 설명 |
|--------|------|
| `profiles` | 유저 역할/국가 (buyer/seller) |
| `companies` | 기업 사업자 정보 |
| `contacts` | 담당자 정보 |
| `company_profiles` | 기업 소개, 로고, 인증 이력 |
| `products` | 제품/서비스 정보 및 사진 |
| `listings` | Buyer가 등록한 공고 |
| `quotes` | Seller가 제출한 견적 |
| `contracts` | 낙찰 후 생성된 계약 |
| `messages` | 계약 당사자 간 채팅 |
| `documents` | 사업자 서류 업로드 |
| `seller_stats` | 거래 실적 집계 (VIEW) |

### RLS 보안 정책

```
profiles        → 본인만 조회/수정
listings        → Buyer만 등록, 전체 조회 가능
quotes          → Seller만 등록, 해당 Buyer만 조회
contracts       → 계약 당사자만 조회
messages        → 계약 당사자만 조회/작성
company_profiles → 전체 조회 가능, 본인만 수정
products        → 전체 조회 가능, 본인만 등록/수정/삭제
documents       → 본인만 조회, 관리자만 verified 수정
```

---

## 🔐 인증 / 권한 플로우

```
회원가입
  국적 선택 → 약관 동의 → 기업정보 입력
  → Supabase Auth 계정 생성
  → profiles / companies / contacts 저장
  → 역할별 대시보드 이동

로그인
  이메일 + 비밀번호 → Supabase Auth 검증
  → profiles에서 role 확인
  → buyer  →  /buyer/dashboard
  → seller →  /seller/dashboard

미들웨어
  미인증       → /login 리다이렉트
  buyer        → /seller/* 접근 차단
  seller       → /buyer/* 접근 차단
```

---

## 🏢 기업 프로필 페이지

Buyer가 견적 검토 시 Seller 기업 정보를 확인하는 공개 페이지

```
공고 등록 (Buyer)
    ↓
Seller 견적 제출
    ↓
Buyer → 견적 목록 조회 → Seller 프로필 클릭
    ↓
기업 프로필 확인
  - 회사 소개 / 로고
  - 주요 제품 및 사진
  - 카탈로그 PDF
  - 거래 실적 (납품 완료 건수, 견적 응답률)
  - 인증/수상 이력
    ↓
낙찰 선정
```

---

## ⚡ 실시간 기능

Supabase Realtime (PostgreSQL CDC) 활용

| 기능 | 트리거 | 대상 |
|------|--------|------|
| 채팅 | messages INSERT | 계약 당사자 |
| 견적 알림 | quotes INSERT | Buyer |
| 낙찰 알림 | contracts UPDATE | Seller |
| 계약 상태 변경 | contracts UPDATE | 양측 |

---

## 📦 파일 업로드

Supabase Storage 버킷 구조

```
documents/  {profile_id}/npwp.pdf
            {profile_id}/nib.pdf
            {profile_id}/business_license.pdf
listings/   {listing_id}/attachment.pdf
profiles/   {profile_id}/logo.png
products/   {profile_id}/{product_id}/image.png
            {profile_id}/{product_id}/catalog.pdf
```

---

## 🌏 국제화 계획

| 항목 | 내용 |
|------|------|
| 다국어 | next-intl (ko / id / en) |
| 시간대 | KST (UTC+9) ↔ WIB (UTC+7), DB는 UTC 저장 |
| 통화 | KRW ↔ IDR, 실시간 환율 API 연동 예정 |

---

## 🚀 로컬 실행

```bash
# 패키지 설치
pnpm install

# 환경변수 설정
cp .env.example .env.local
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# 개발 서버 실행
pnpm dev
```

---

## 🌿 Git Flow

```
main      ← 프로덕션 배포 (직접 push 금지)
develop   ← 개발 통합 브랜치
feat/*    ← 기능 개발
fix/*     ← 버그 수정
```

---

## 📋 API 엔드포인트

```
# 인증
POST /api/auth/check-username     아이디 중복 확인
POST /api/auth/signup             회원가입 처리

# 공고
GET  /api/listings                공고 목록
POST /api/listings                공고 등록
GET  /api/listings/[id]           공고 상세
PUT  /api/listings/[id]           공고 수정
DEL  /api/listings/[id]           공고 삭제

# 견적
GET  /api/quotes                  견적 목록
POST /api/quotes                  견적 제출
GET  /api/quotes/[id]             견적 상세
PUT  /api/quotes/[id]             낙찰 선정

# 계약
GET  /api/contracts               계약 목록
POST /api/contracts               계약 생성
GET  /api/contracts/[id]          계약 상세

# 채팅
GET  /api/messages/[contractId]   채팅 내역
POST /api/messages                메시지 전송

# 기업 프로필
GET  /api/companies/[id]          기업 프로필 조회
PUT  /api/companies/[id]          프로필 수정
POST /api/companies/[id]/products 제품 등록
PUT  /api/companies/[id]/products/[productId]  제품 수정
DEL  /api/companies/[id]/products/[productId]  제품 삭제
GET  /api/companies/[id]/stats    거래 실적 조회

# 파일
POST /api/uploads/document        서류 업로드
POST /api/uploads/product-image   제품 이미지 업로드
```