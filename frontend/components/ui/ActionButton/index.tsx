// components/ui/ActionButton/index.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

// 행 안 액션 버튼의 위계 — 주요(굵은 색상) → 보조(옅은 테두리) → 위험(텍스트만 남겨
// 시각적으로 가장 약하게). ContractListTable/PaymentsListTable이 이 규칙을 공유해
// 같은 의미의 버튼이 화면마다 다른 색으로 어긋나지 않게 한다.
export const actionButtonVariants = cva(
	"flex w-full items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60",
	{
		variants: {
			tone: {
				primary: "bg-[#16A34A] text-white hover:bg-[#15803D]",
				primaryBlue: "bg-imsg-blue text-white hover:bg-[#2563EB]",
				primaryDisabled: "border border-hairline text-subtle",
				secondary: "text-imsg-blue border border-[#BFDBFE] bg-[#EFF6FF] hover:bg-[#DBEAFE]",
				secondarySuccess: "border border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A] hover:bg-[#DCFCE7]",
				secondaryNeutral: "border border-hairline text-[#374151] hover:bg-[#F9FAFB]",
				danger: "border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]",
				dangerGhost: "text-subtle hover:bg-[#F3F4F6] hover:text-[#DC2626]",
			},
			size: {
				sm: "px-2.5 py-1.5 text-xs",
				md: "px-4 py-2.5 text-sm",
			},
		},
		defaultVariants: {
			tone: "secondaryNeutral",
			size: "sm",
		},
	},
);

type ActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof actionButtonVariants>;

export function ActionButton({
	tone,
	size,
	className,
	type = "button",
	...props
}: ActionButtonProps): React.ReactNode {
	return (
		<button
			type={type}
			className={cn(actionButtonVariants({ tone, size }), className)}
			{...props}
		/>
	);
}
