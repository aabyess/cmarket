"use client";

import { useSearchParams } from "next/navigation";
import { SignupInfoIndonesia } from "@/features/auth/components/SignupInfo/SignupInfoIndonesia";
import { SignupInfoKorea } from "@/features/auth/components/SignupInfo/SignupInfoKorea";

export function SignupInfoRouter() {
	const searchParams = useSearchParams();
	const country = searchParams.get("country");

	if (country === "korea") return <SignupInfoKorea />;
	return <SignupInfoIndonesia />;
}