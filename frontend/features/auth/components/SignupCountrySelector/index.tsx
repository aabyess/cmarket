"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignupCountrySelectorCard } from "./SignupCountrySelectorCard";

type Country = "indonesia" | "korea";

export function SignupCountrySelector() {
  const t = useTranslations("SignupCountrySelector");
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  function handleBack() {
    router.back();
  }

  function handleNext() {
    if (!selectedCountry) return;
    router.push(`/signup/terms?country=${selectedCountry}`);
  }

  function handleSelect(country: Country) {
    setSelectedCountry(country);
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
            {t("back")}
          </button>
          <div className="text-sm font-semibold text-foreground">{t("step")}</div>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-2xl space-y-8">
          <p className="text-center text-sm text-muted-foreground">
            {t("description")}
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            <SignupCountrySelectorCard
              country="indonesia"
              isSelected={selectedCountry === "indonesia"}
              onSelect={handleSelect}
            />
            <SignupCountrySelectorCard
              country="korea"
              isSelected={selectedCountry === "korea"}
              onSelect={handleSelect}
            />
          </div>

          <Button
            onClick={handleNext}
            disabled={!selectedCountry}
            className="w-full h-12 font-semibold text-base bg-imsg-blue hover:bg-[#2563EB] text-white disabled:bg-[#D1D5DB] disabled:text-[#6B7280] flex items-center justify-center group"
          >
            {t("next")}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </main>
  );
}