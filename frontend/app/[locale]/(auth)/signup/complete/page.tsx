import { SignupComplete } from "@/features/auth/components/SignupComplete";

type SignupCompletePageProps = {
	searchParams: Promise<{ role?: string }>;
};

export default async function SignupCompletePage({ searchParams }: SignupCompletePageProps) {
	const { role } = await searchParams;
	const resolvedRole = role === "seller" ? "seller" : "buyer";

	return <SignupComplete role={resolvedRole} />;
}