// components/commons/PageLoading/index.tsx
import { Loader2 } from "lucide-react";

export function PageLoading(): React.JSX.Element {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-imsg-secondary">
			<Loader2 size={28} className="animate-spin text-imsg-blue" />
			<p className="text-sm">불러오는 중...</p>
		</div>
	);
}
