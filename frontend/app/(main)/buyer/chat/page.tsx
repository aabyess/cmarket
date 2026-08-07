import { notFound } from "next/navigation";
import { ChatView } from "@/features/chat/components/ChatView";
import { getChatContext } from "@/features/chat/serverApis";

type BuyerChatPageProps = {
	searchParams: Promise<{ quoteId?: string }>;
};

export default async function BuyerChatPage({ searchParams }: BuyerChatPageProps) {
	const { quoteId } = await searchParams;
	const context = await getChatContext("buyer");
	if (!context) notFound();

	return <ChatView context={context} initialQuoteId={quoteId} />;
}