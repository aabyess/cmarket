import { notFound } from "next/navigation";
import { ChatView } from "@/features/chat/components/ChatView";
import { getChatContext } from "@/features/chat/serverApis";

type SellerChatPageProps = {
	searchParams: Promise<{ quoteId?: string }>;
};

export default async function SellerChatPage({ searchParams }: SellerChatPageProps) {
	const { quoteId } = await searchParams;
	const context = await getChatContext("seller");
	if (!context) notFound();

	return <ChatView context={context} initialQuoteId={quoteId} />;
}
