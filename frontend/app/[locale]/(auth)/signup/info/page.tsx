import { Suspense } from "react";
import { SignupInfoRouter } from "@/features/auth/components/SignupInfo/SignupInfoRouter";

export default function SignupInfoPage() {
	return (
		<Suspense>
			<SignupInfoRouter />
		</Suspense>
	);
}