import { Suspense } from "react";
import { SignupTerms } from "@/features/auth/components/SignupTerms";

export default function SignupTermsPage() {
  return (
    <Suspense>
      <SignupTerms />
    </Suspense>
  );
}