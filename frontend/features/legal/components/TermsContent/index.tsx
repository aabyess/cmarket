// features/legal/components/TermsContent/index.tsx

export function TermsContent(): React.ReactNode {
	return (
		<div className="space-y-6">
			<section>
				<h2 className="text-base font-semibold text-[#1F2937]">제1조 (목적)</h2>
				<p className="mt-2">
					이 약관은 [회사명](이하 “회사”)가 운영하는 B2B 조달 플랫폼 MitraPay(이하 “서비스”)의
					이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 이용 조건 및 절차 등 기본적인
					사항을 규정함을 목적으로 합니다.
				</p>
			</section>

			<section>
				<h2 className="text-base font-semibold text-[#1F2937]">제2조 (정의)</h2>
				<ul className="mt-2 list-disc space-y-1 pl-5">
					<li>
						“서비스”란 발주기업(바이어)과 공급기업(셀러) 간 견적 요청, 견적 제출, 계약 체결 및
						거래 관리를 지원하는 회사의 온라인 플랫폼을 말합니다.
					</li>
					<li>“회원”이란 이 약관에 동의하고 서비스에 가입한 발주기업 및 공급기업을 말합니다.</li>
					<li>“공고”란 발주기업이 서비스에 등록하는 조달 요청 게시물을 말합니다.</li>
					<li>“견적”이란 공급기업이 공고에 대해 제출하는 가격·납기 등의 제안을 말합니다.</li>
				</ul>
			</section>

			<section>
				<h2 className="text-base font-semibold text-[#1F2937]">제3조 (약관의 효력 및 변경)</h2>
				<p className="mt-2">
					① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이
					발생합니다.
				</p>
				<p className="mt-1">
					② 회사는 관련 법령을 위반하지 않는 범위에서 이 약관을 개정할 수 있으며, 개정 시 적용일자
					및 개정사유를 명시하여 사전 공지합니다.
				</p>
			</section>

			<section>
				<h2 className="text-base font-semibold text-[#1F2937]">제4조 (서비스의 내용)</h2>
				<p className="mt-2">
					회사는 공고 등록, 견적 제출, 채팅을 통한 협의, 계약 체결, 인보이스 발행, AI를 활용한
					공고·견적 초안 자동 생성 등의 기능을 제공합니다. 서비스의 세부 내용은 회사 사정에 따라
					추가·변경될 수 있습니다.
				</p>
			</section>

			<section>
				<h2 className="text-base font-semibold text-[#1F2937]">제5조 (회원의 의무)</h2>
				<ul className="mt-2 list-disc space-y-1 pl-5">
					<li>회원은 가입 시 및 서비스 이용 중 사실에 근거한 정보를 제공해야 합니다.</li>
					<li>회원은 타인의 계정을 도용하거나 서비스를 부정한 목적으로 이용해서는 안 됩니다.</li>
					<li>회원은 공고·견적 등록 시 허위 또는 과장된 내용을 게시해서는 안 됩니다.</li>
					<li>
						회원은 관계 법령, 이 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 사항을 준수해야
						합니다.
					</li>
				</ul>
			</section>

			<section>
				<h2 className="text-base font-semibold text-[#1F2937]">제6조 (결제 및 정산)</h2>
				<p className="mt-2">
					① 발주기업과 공급기업 간의 대금 결제는 회원 간 별도로 협의한 조건에 따라 이루어지며,
					회사는 결제의 당사자가 아닙니다.
				</p>
				<p className="mt-1">② 회사가 제공하는 유료 요금제의 이용료 및 결제 조건은 별도로 정합니다.</p>
			</section>

			<section>
				<h2 className="text-base font-semibold text-[#1F2937]">제7조 (면책조항)</h2>
				<p className="mt-2">
					① 회사는 회원 간 거래(공고, 견적, 계약 체결, 대금 결제, 납품 등)와 관련하여 발생하는
					분쟁에 대해 직접적인 책임을 지지 않으며, 거래를 중개하는 플랫폼으로서의 역할에
					한정됩니다.
				</p>
				<p className="mt-1">
					② 회사는 천재지변, 회원의 귀책사유 등 회사가 통제할 수 없는 사유로 인한 서비스 중단에
					대해 책임을 지지 않습니다.
				</p>
			</section>

			<section>
				<h2 className="text-base font-semibold text-[#1F2937]">제8조 (분쟁해결)</h2>
				<p className="mt-2">
					회사와 회원 간 발생한 분쟁에 대해서는 상호 협의하여 해결함을 원칙으로 하며, 협의가
					이루어지지 않을 경우 관련 법령이 정하는 절차에 따릅니다.
				</p>
			</section>

			<section>
				<h2 className="text-base font-semibold text-[#1F2937]">제9조 (준거법 및 관할법원)</h2>
				<p className="mt-2">
					이 약관과 관련한 분쟁에 대해서는 대한민국 법을 준거법으로 하며, 관할법원은 민사소송법에
					따른 관할법원으로 합니다.
				</p>
			</section>

			<section>
				<h2 className="text-base font-semibold text-[#1F2937]">부칙</h2>
				<p className="mt-2">이 약관은 [YYYY-MM-DD]부터 적용됩니다.</p>
			</section>
		</div>
	);
}
