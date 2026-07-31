import { ChatView } from "@/features/chat/components/ChatView";

type BuyerChatRoomPageProps = {
	params: Promise<{ contractId: string }>;
};

export default async function BuyerChatRoomPage({ params }: BuyerChatRoomPageProps) {
	const { contractId } = await params;

	return (
		<div className="px-8 py-6 xl:px-12">
			<ChatView activeContractId={contractId} />
		</div>
	);
}