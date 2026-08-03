import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-6"
      style={{ backgroundColor: "#F0F5FF" }}
    >
      <div className="text-center space-y-3">
        <p className="text-8xl font-bold text-[#3B82F6]">404</p>
        <h1 className="text-2xl font-bold text-[#1F2937]">페이지를 찾을 수 없습니다</h1>
        <p className="text-sm text-[#6B7280]">
          한국 공급기업 가입 페이지는 준비 중입니다.
        </p>
      </div>
      <Link
        href="/signup"
        className="px-6 py-3 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-sm transition-colors"
      >
        처음으로 돌아가기
      </Link>
    </main>
  );
}