# 인도네시아 B2B 거래 필요 서류 및 규제 조사

> 조사일: 2026-08-18
> 목적: C-Market(한국-인도네시아 B2B 트레이딩 플랫폼)을 인도네시아에서 운영할 때 필요한 거래 서류, 약관, 법적 규제 파악

---

## 1. 거래 당사자(기업)가 갖춰야 할 기본 등록 서류

| 서류 | 내용 |
|---|---|
| **NIB** (Nomor Induk Berusaha) | 사업자등록번호. OSS(Online Single Submission) 시스템에서 발급. 수입업의 경우 NIB가 수입업자 번호(API) 역할까지 겸함 |
| **NPWP** (Nomor Pokok Wajib Pajak) | 세금번호. 모든 기업 필수이며 세무·통관·모든 거래 서류에 기재됨 |
| **PKP 지정** | 연매출 48억 루피아(IDR 4.8 billion) 초과 시 VAT 과세사업자(PKP)로 등록해야 하며, 이때부터 세금계산서(Faktur Pajak) 발행 의무 발생 |
| **Akta Pendirian** | 법인 설립증서 + 법무인권부 승인. 통관 등록 시에도 요구됨 |
| **API-U / API-P** | 수입 목적 구분 — 유통·재판매용(API-U) vs 자가 생산용(API-P) |

## 2. 거래 단계별 문서 흐름 (인도네시아 B2B 관행)

인도네시아 B2B 거래의 일반적인 문서 흐름. 플랫폼의 견적서/인보이스 기능과 그대로 매핑된다.

1. **Surat Penawaran** — 견적서/제안서
2. **PO** (Purchase Order) — 발주서
3. **계약서** (Kontrak / SPK)
4. **Invoice** — 상업 인보이스
5. **Faktur Pajak** — 세금계산서 ★핵심
   - B2B·B2G의 VAT 과세 거래는 전부 **e-Faktur 전자 발행 의무**
   - 2025년부터 국세청 **Coretax** 시스템이 인보이스 번호를 직접 채번
   - 판매자·구매자 양쪽의 NPWP 기재 필수
   - 미준수 시 과세표준의 1% 벌금
   - ※ 플랫폼이 발행하는 인보이스 PDF는 "상업 인보이스"이고, 세금계산서(Faktur Pajak)는 국세청 시스템에서 별도 발행됨 — 두 문서를 구분해야 함
6. **Surat Jalan** — 배송증/운송장. 화물과 함께 이동하는 배송 증빙
7. **BAST** (Berita Acara Serah Terima) — 인수인계 확인서. 납품 완료의 공식 증빙. PO·Surat Jalan을 참조해 작성하며, 법적 증거력을 위해 **e-Meterai(전자인지, Rp 10,000)** 첩부 권장
8. **Kwitansi** — 영수증. 대금 수령 증빙

## 3. 한국 ↔ 인도네시아 무역(수출입) 서류

- **기본 선적 서류**: Commercial Invoice, Packing List, B/L(또는 AWB), 원산지증명서(C/O)
- **관세 혜택**: **IK-CEPA**(한-인니 CEPA) 또는 **AKFTA Form AK** 원산지증명서 첨부 시 특혜관세(다수 품목 0%) 적용
  - 원산지 기준: RVC(역내부가가치) 40% 또는 CTH(세번변경기준) 충족 필요
- **인도네시아 측 통관**: **PIB**(Pemberitahuan Impor Barang, 수입신고서)를 선박/항공기 도착 24시간 내에 **INSW/CEISA** 시스템으로 전자 제출
- **품목별 추가 인증**: 공산품 **SNI**, 화학약품·식품류 **BPOM** 등
  - 주요 취급 품목에 화학약품이 있으므로 BPOM/사전수입승인 대상 여부 확인 필요

## 4. 플랫폼 운영 시 약관·법률 요건

### 4.1 전자상거래(PMSE) 규제
- **PP 80/2019**: PMSE(전자시스템을 통한 거래) 라이선스의 기본 틀
- **Permendag 31/2023** → **Permendag 19/2026** (2026-06-08 발효, 31/2023 대체)
  - 인도네시아 대상 플랫폼(PPMSE)의 등록 의무
  - 입점 판매자의 NIB 보유 의무
  - 해외 사업자 등록 기준: 연간 거래 소비자 1,000명 이상 / 배송 1,000건 이상 / 일정 트래픽 기준
  - 신규 규정이므로 런칭 전 원문 확인 필요

### 4.2 PSE 등록
- 인도네시아 이용자를 대상으로 하는 전자시스템 운영자는 Kominfo(통신정보부)에 PSE 등록 필요

### 4.3 계약 언어 (Law 24/2009)
- 인도네시아 당사자가 참여하는 계약은 **인도네시아어 버전 필수**
- 외국 당사자가 있으면 영어 등 병기 가능하되, 해석 충돌 시 **우선언어 조항** 명시 필요
- 대법원 판례상 인니어 버전 부재만으로 자동 무효는 아니지만 분쟁 리스크 큼
- → 약관·플랫폼 생성 계약서·견적서에 id 로케일이 필수인 법적 근거

### 4.4 전자서명 (PP 71/2019)
- 전자서명은 법적으로 유효. 공인(certified) / 비공인(non-certified)으로 구분
- 계약 체결 기능 도입 시 현지 공인 전자서명 사업자(PrivyID, Mekari Sign 등) 연동이 증거력 면에서 유리

### 4.5 개인정보보호 (UU PDP 27/2022)
- 인도네시아판 GDPR. 2024-10-17 유예기간 종료로 전면 시행 중
- 처리 근거 문서화, 명시적 동의, 유출 시 기한 내 통지 의무
- 형사처벌 조항 존재 → 약관·개인정보처리방침에 반드시 반영

## 5. 플랫폼에 주는 시사점

1. 판매자/구매자 프로필에 **NIB·NPWP 필드**를 받아두면 인보이스·세금계산서 요건과 바로 연결됨
2. 플랫폼 인보이스 PDF와 별개로 **Faktur Pajak은 Coretax에서 발행**된다는 안내 필요
3. 거래 문서 흐름에 **Surat Jalan·BAST** 단계(납품 확인)가 관행상 존재 → 납품 관리 기능 설계 시 참고
4. 약관·계약·견적서는 **인도네시아어 버전 필수** + 우선언어 조항, **UU PDP 준수 개인정보처리방침** 필요
5. 2026년 6월 발효된 **Permendag 19/2026**이 조사 시점 기준 최신 규제 → 실제 런칭 전 현지 법률 자문으로 등록 의무 해당 여부 확인 권장

## 출처

- [Indonesia E-Invoicing Guide: Coretax Rules (DDD Invoices)](https://dddinvoices.com/learn/e-invoicing-in-indonesia)
- [e-Faktur Indonesia Coretax 2026 Guide (XPND)](https://xpnd.co.id/blogs/e-faktur-indonesia-coretax-2026/)
- [Guide to e-Faktur System for PKP Businesses (Lets Move Indonesia)](https://www.letsmoveindonesia.com/tax-in-indonesia-guide-to-e-faktur-system-for-pkp-businesses/)
- [Import License Indonesia: API-U, API-P, NIB (Insight of Indonesia)](https://insightof.id/import-license-indonesia/)
- [Indonesia Import Customs Clearance Guide (Customspedia)](https://customspedia.com/indonesia-import-customs-clearance-guide/)
- [Import Licenses and Customs Regulation (Kusuma Law Firm)](https://kusumalawfirm.com/article/import-licenses-and-customs-regulation-for-foreign-businesses-in-indonesia/)
- [Indonesia Ecommerce Regulation: Permendag 19/2026 (DFDL)](https://www.dfdl.com/insights/legal-and-tax-updates/indonesia-ecommerce-regulation-permendag-19-2026/)
- [Permendag 31/2023 affecting foreign e-commerce businesses (Rouse)](https://rouse.com/insights/news/2023/indonesian-ministry-of-trade-regulation-no-31-2023-affecting-foreign-online-e-commerce-businesses)
- [Preferential Tariffs Under RCEP and IK-CEPA (SSEK Law Firm)](https://ssek.com/blog/indonesia-update-preferential-tariffs-under-the-rcep-and-ik-cepa/)
- [ASEAN-Korea FTA](https://akfta.asean.org/)
- [Supreme Court clarifies contract language requirement (HLC)](https://www.hlc.com/en/publications/language-barrier-supreme-court-clarifies-language-requirement-in-contracts-in-indonesia)
- [Indonesian Language Requirements for Contracts (HSF Kramer)](https://www.hsfkramer.com/insights/2019-11/update-on-indonesian-language-requirements-for-contracts-with-indonesian-parties)
- [Electronic contracts in Indonesia (Lexology)](https://www.lexology.com/library/detail.aspx?g=afe24f11-6f6b-40f6-bb7b-0fab7065d245)
- [UU PDP 27/2022 Indonesia Data Protection Guide (XPND)](https://xpnd.co.id/regulatory/uu-pdp-27-2022-indonesia/)
- [Indonesia's Personal Data Protection Law (ASEAN Briefing)](https://www.aseanbriefing.com/doing-business-guide/indonesia/company-establishment/personal-data-protection-law)
- [BAST 형식과 예시 (Bee.id)](https://www.bee.id/blog/bast-adalah/)
- [Contoh Berita Acara Serah Terima + e-Meterai (Mekari Sign)](https://mekarisign.com/id/blog/contoh-berita-acara-serah-terima/)
