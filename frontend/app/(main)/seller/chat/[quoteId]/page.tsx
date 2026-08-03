import { notFound } from "next/navigation";
import { ChatRoomView } from "@/features/chat/components/ChatRoomView";
import { getChatRoomDetail, getQuoteSellerId } from "@/features/chat/serverApis";

type SellerChatRoomPageProps = {
	params: Promise<{ quoteId: string }>;
};

export default async function SellerChatRoomPage({ params }: SellerChatRoomPageProps) {
	const { quoteId } = await params;
	const [room, sellerId] = await Promise.all([
		getChatRoomDetail(quoteId),
		getQuoteSellerId(quoteId),
	]);

	if (!room) notFound();

	return <ChatRoomView room={room} sellerId={sellerId ?? ""} />;
}