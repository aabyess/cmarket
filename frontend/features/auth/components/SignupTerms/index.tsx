"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

type Term = {
  id: string;
  label: string;
  required: boolean;
};

const TERMS: Term[] = [
  { id: "service", label: "서비스 이용약관 동의", required: true },
  { id: "privacy", label: "개인정보 수집 및 이용 동의", required: true },
  { id: "thirdparty", label: "제3자 정보 제공 동의", required: true },
  { id: "marketing", label: "마케팅 정보 수신 동의", required: false },
];

export function SignupTerms() {
  const router = useRouter();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const isAllChecked = TERMS.every((t) => checked[t.id]);
  const isRequiredChecked = TERMS.filter((t) => t.required).every((t) => checked[t.id]);

  function handleAll() {
    if (isAllChecked) {
      setChecked({});
    } else {
      const all: Record<string, boolean> = {};
      TERMS.forEach((t) => (all[t.id] = true));
      setChecked(all);
    }
  }

  function handleToggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleBack() {
    router.back();
  }

  function handleNext() {
    if (!isRequiredChecked) return;
    router.push("/signup/info");
  }

  return (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: "#F0F5FF" }}>
      <header className="border-b border-[#E2E8F0] px-4 py-4 sm:px-6 sm:py-5 bg-white flex justify-center">
        <div className="flex items-center justify-between w-full max-w-2xl">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            이전
          </button>
          <div className="text-sm font-semibold text-foreground">2 / 4</div>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-[#1F2937]">약관 동의</h1>
            <p className="text-sm text-muted-foreground">
              회원가입을 위해 이용약관에 동의해 주세요.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            {/* 전체 동의 */}
            <button
              onClick={handleAll}
              className="w-full flex items-center gap-3 px-6 py-5 hover:bg-gray-50 transition-colors"
            >
              <div
                className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0",
                  isAllChecked
                    ? "bg-[#3B82F6] border-[#3B82F6]"
                    : "border-[#D1D5DB] bg-white",
                )}
              >
                {isAllChecked && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="font-semibold text-[#1F2937]">전체 동의</span>
            </button>

            <div className="border-t border-[#E2E8F0]" />

            {/* 개별 약관 */}
            <div className="divide-y divide-[#E2E8F0]">
              {TERMS.map((term) => (
                <div key={term.id} className="flex items-center px-6 py-4">
                  <button
                    onClick={() => handleToggle(term.id)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0",
                        checked[term.id]
                          ? "bg-[#3B82F6] border-[#3B82F6]"
                          : "border-[#D1D5DB] bg-white",
                      )}
                    >
                      {checked[term.id] && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-[#374151]">
                      <span
                        className={cn(
                          "font-medium mr-1",
                          term.required ? "text-[#3B82F6]" : "text-[#9CA3AF]",
                        )}
                      >
                        {term.required ? "[필수]" : "[선택]"}
                      </span>
                      {term.label}
                    </span>
                  </button>
                  <button className="text-[#9CA3AF] hover:text-[#374151] transition-colors ml-2">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={!isRequiredChecked}
            className={cn(
              "w-full h-12 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all",
              isRequiredChecked
                ? "bg-[#3B82F6] hover:bg-[#2563EB] text-white"
                : "bg-[#D1D5DB] text-[#6B7280] cursor-not-allowed",
            )}
          >
            다음으로 넘어가기
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <footer className="py-6 text-center text-xs text-[#9CA3AF]">
        © 2003 Cmarket Corp. All rights reserved.
      </footer>
    </main>
  );
}