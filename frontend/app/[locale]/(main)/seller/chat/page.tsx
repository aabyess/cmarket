import { notFound } from "next/navigation";
import { ChatView } from "@/features/chat/components/ChatView";
import { getChatContext } from "@/features/chat/serverApis";

export default async function SellerChatPage() {
	const context = await getChatContext("seller");
	if (!context) notFound();

	return <ChatView context={context} />;
}