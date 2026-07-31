import { ChatView } from "@/features/chat/components/ChatView";

export default function BuyerChatPage() {
	return (
		<div className="px-8 py-6 xl:px-12">
			<ChatView activeContractId={null} />
		</div>
	);
}