// features/auth/components/LogoutButton.tsx
"use client";

import { useRouter } from "@/i18n/navigation";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLogout } from "@/features/auth/mutations";
import { cn } from "@/utils/cn";

type LogoutButtonProps = {
	className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps): React.JSX.Element {
	const t = useTranslations("LogoutButton");
	const router = useRouter();
	const { mutate: logout, isPending } = useLogout();

	function handleLogout(): void {
		logout(undefined, {
			onSuccess: () => router.push("/login"),
		});
	}

	return (
		<button
			type="button"
			onClick={handleLogout}
			disabled={isPending}
			className={cn(
				"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition-colors duration-200 hover:bg-[#FEF2F2] disabled:opacity-50",
				className,
			)}
		>
			<LogOut size={17} className="shrink-0" />
			{t("logout")}
		</button>
	);
}
