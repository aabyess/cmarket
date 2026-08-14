"use client";

import { useState } from "react";
import { ShoppingCart, Package } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/utils/cn";
import { SignupCountrySelectorCheckmark } from "./SignupCountrySelectorCheckmark";

type Country = "indonesia" | "korea";

type SignupCountrySelectorCardProps = {
  country: Country;
  isSelected: boolean;
  onSelect: (country: Country) => void;
};

const COUNTRY_CONFIG = {
  indonesia: {
    flagUrl: "https://flagcdn.com/w160/id.png",
    flagEmoji: "🇮🇩",
    name: "인도네시아",
    badge: "구매 · 발주",
    description: "상품/서비스를 구매하는 기업",
    Icon: ShoppingCart,
  },
  korea: {
    flagUrl: "https://flagcdn.com/w160/kr.png",
    flagEmoji: "🇰🇷",
    name: "대한민국",
    badge: "판매 · 견적",
    description: "상품/서비스를 판매하는 기업",
    Icon: Package,
  },
} as const;

export function SignupCountrySelectorCard({
  country,
  isSelected,
  onSelect,
}: SignupCountrySelectorCardProps): React.ReactNode {
  const [imageError, setImageError] = useState(false);
  const { flagUrl, flagEmoji, name, badge, description, Icon } = COUNTRY_CONFIG[country];

  function handleSelect(): void {
    onSelect(country);
  }

  function handleImageError(): void {
    setImageError(true);
  }

  return (
    <motion.button
      onClick={handleSelect}
      whileHover={{ y: -4 }}
      animate={{
        boxShadow: isSelected
          ? "0 8px 24px rgba(59, 130, 246, 0.15)"
          : "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative flex flex-col items-center gap-4 rounded-2xl border p-8 bg-white transition-colors duration-200",
        isSelected ? "border-imsg-blue border-2" : "border-[#E2E8F0] hover:border-[#D1D5DB]",
      )}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-imsg-blue bg-[#EFF6FF] border border-[#BFDBFE]">
          {badge}
        </span>
      </div>

      <SignupCountrySelectorCheckmark isSelected={isSelected} />

      <div className="mt-4 flex items-center justify-center w-14 h-14 rounded-xl bg-[#EFF6FF]">
        <Icon className="w-7 h-7 text-imsg-blue" />
      </div>

      {!imageError ? (
        <motion.img
          src={flagUrl}
          alt={`${name} 국기`}
          className="w-30 h-24 rounded-lg object-cover border border-[#E2E8F0]"
          crossOrigin="anonymous"
          onError={handleImageError}
          animate={isSelected ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      ) : (
        <motion.div
          className="w-30 h-24 rounded-lg bg-muted flex items-center justify-center text-3xl border border-[#E2E8F0]"
          animate={isSelected ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {flagEmoji}
        </motion.div>
      )}

      <h3 className="text-lg font-semibold text-foreground">{name}</h3>
      <p className="text-center text-sm text-muted-foreground">{description}</p>
    </motion.button>
  );
}