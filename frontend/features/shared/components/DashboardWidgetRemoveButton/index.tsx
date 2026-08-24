// features/shared/components/DashboardWidgetRemoveButton/index.tsx
"use client";

import { X } from "lucide-react";

type DashboardWidgetRemoveButtonProps = {
	label: string;
	onRemove: () => void;
};

// 편집 모드에서 위젯 카드 우상단에 겹쳐 보이는 제거 버튼. 카드 바깥으로 살짝 걸치게
// 배치해 카드 안쪽의 클릭 가능한 콘텐츠(버튼·링크)와 겹치지 않게 한다. 위젯마다
// 카드 루트 요소에 relative만 추가하면 이 버튼을 그대로 넣을 수 있다.
export function DashboardWidgetRemoveButton({
	label,
	onRemove,
}: DashboardWidgetRemoveButtonProps): React.ReactNode {
	return (
		<button
			type="button"
			onClick={onRemove}
			aria-label={label}
			className="absolute -top-2 -right-2 z-10 flex size-6 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-imsg-secondary shadow-sm transition-colors hover:bg-red-50 hover:text-red-500">
			<X size={13} />
		</button>
	);
}
