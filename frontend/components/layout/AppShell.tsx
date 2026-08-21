// components/layout/AppShell.tsx
"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { usePersistentState } from "@/hooks/usePersistentState";
import { SIDEBAR_TRANSITION_CLASS } from "@/components/layout/sidebarTransition";
import { cn } from "@/utils/cn";

type AppShellProps = {
	role: "buyer" | "seller";
	companyName: string;
	name: string;
	children: React.ReactNode;
};

export function AppShell({ role, companyName, name, children }: AppShellProps): React.ReactNode {
	const [isCollapsed, setIsCollapsed] = usePersistentState("mitrapay:sidebar-collapsed", false);

	return (
		<div className="flex min-h-screen bg-[#F7F8F8]">
			<Sidebar
				role={role}
				companyName={companyName}
				name={name}
				isCollapsed={isCollapsed}
				onToggleCollapsed={() => setIsCollapsed((prev) => !prev)}
			/>
			<div
				className={cn(
					"flex-1 transition-[margin]",
					SIDEBAR_TRANSITION_CLASS,
					isCollapsed ? "lg:ml-20" : "lg:ml-64",
				)}
			>
				<main>{children}</main>
			</div>
		</div>
	);
}
