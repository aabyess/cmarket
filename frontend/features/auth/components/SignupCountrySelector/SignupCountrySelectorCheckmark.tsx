"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import checkmarkAnimation from "@/public/animations/checkmark.json";

const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => <CheckCircle2 className="size-full text-imsg-blue" />,
});

type SignupCountrySelectorCheckmarkProps = {
  isSelected: boolean;
};

export function SignupCountrySelectorCheckmark({
  isSelected,
}: SignupCountrySelectorCheckmarkProps) {
  return (
    <AnimatePresence>
      {isSelected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="absolute right-4 top-4 w-10 h-10"
        >
          <Lottie
            animationData={checkmarkAnimation}
            loop={false}
            autoplay={true}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}