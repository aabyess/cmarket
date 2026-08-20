// features/legal/components/PrivacyContent/index.tsx

export function PrivacyContent(): React.ReactNode {
	return (
		<div className="space-y-6">
			<section>
				<h2 className="text-base font-semibold text-[#1F2937]">1. 수집하는 개인정보 항목 및 목적</h2>
				<p className="mt-2">
					[회사명](이하 “회사”)는 회원가입, 서비스 이용, 거래 처리를 위해 아래와 같은 개인정보를
					수집합니다.
				</p>
				<ul className="mt-2 list-disc space-y-1 pl-5">
					<li>
						회원가입: 아이디, 비밀번호, 이메일, 담당자명, 연락처, 소속 기업 정보(사업자등록번호/
						NPWP 등)
					</li>
					<li>거래 처리: 공고·견적 내용, 계약 정보, 결제(계좌) 정보, 배송지 정보</li>
					<li>서비스 이용 과정에서 자동 수집: 접속 로그, 서비스 이용 기록</li>
				</ul>
			</section>

			<section>
				<h2 className="text-base font-semibold text-[#1F2937]">2. 개인정보의 보유 및 이용 기간</h2>
				<p className="mt-2">
					회사는 회원 탈퇴 시 또는 수집·이용 목적이 달성된 후 지체 없이 개인정보를 파기합니다.
					다만 관계 법령에 따라 보존이 필요한 경우 해당 법령이 정한 기간 동안 보관합니다(예:
					전자상거래 등에서의 소비자보호에 관한 법률에 따른 계약·거래 기록).
				</p>
			</section>

			<section>
				<h2 className="text-base font-semibold text-[#1F2937]">3. 개인정보의 제3자 제공 및 처리위탁</h2>
				<p className="mt-2">
					회사는 원칙적으로 회원의 개인정보를 외부에 제공하지 않으며, 서비스 제공을 위해 아래와
					같이 일부 정보 처리를 외부 업체에 위탁합니다.
				</p>
				<ul className="mt-2 list-disc space-y-1 pl-5">
					<li>
						<strong>DeepL SE</strong> — 채팅·공고 등에 입력한 텍스트의 자동 번역 처리를 위해 해당
						콘텐츠가 전송됩니다.
					</li>
					<li>
						<strong>Google (Gemini API)</strong> — AI 공고·견적 초안 자동 생성 기능 이용 시 입력한
						텍스트 및 첨부 파일(PDF/이미지)이 전송됩니다.
					</li>
					<li>인프라(호스팅/데이터베이스): Supabase</li>
				</ul>
				<p className="mt-2">
					위탁받은 업체는 위탁 목적 범위 내에서만 정보를 처리하며, 회사는 위탁 계약 시 개인정보가
					안전하게 관리될 수 있도록 필요한 사항을 규정합니다.
				</p>
			</section>

			<section>
				<h2 className="text-base font-semibold text-[#1F2937]">4. 개인정보의 파기절차 및 방법</h2>
				<p className="mt-2">
					전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여
					삭제하며, 종이 문서에 기록·저장된 개인정보는 분쇄하거나 소각하여 파기합니다.
				</p>
			</section>

			<section>
				<h2 className="text-base font-semibold text-[#1F2937]">
					5. 이용자 및 법정대리인의 권리와 행사방법
				</h2>
				<p className="mt-2">
					회원은 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며, 가입 해지를 요청할 수
					있습니다. 개인정보 조회·수정·삭제(가입해지)는 서비스 내 “설정” 메뉴를 통하거나, 아래
					개인정보 보호책임자에게 서면·이메일 등으로 연락하시면 지체 없이 조치합니다.
				</p>
			</section>

			<section>
				<h2 className="text-base font-semibold text-[#1F2937]">6. 개인정보 보호책임자</h2>
				<p className="mt-2">
					회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 회원의
					불만 처리 및 피해 구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
				</p>
				<ul className="mt-2 list-disc space-y-1 pl-5">
					<li>성명: [보호책임자명]</li>
					<li>연락처: support@mitrapay.com</li>
				</ul>
			</section>

			<section>
				<h2 className="text-base font-semibold text-[#1F2937]">부칙</h2>
				<p className="mt-2">이 개인정보처리방침은 [YYYY-MM-DD]부터 적용됩니다.</p>
			</section>
		</div>
	);
}
