import { ChatRoomList } from "@/features/chat/components/ChatRoomList";
import { getChatRooms } from "@/features/chat/serverApis";

export default async function BuyerChatLayout({ children }: { children: React.ReactNode }) {
	const rooms = await getChatRooms("buyer");

	return (
		<div className="flex h-[calc(100vh-4rem)]">
			<aside className="w-80 shrink-0 overflow-y-auto border-r border-[#E5E7EB] bg-white">
				<div className="border-b border-[#E5E7EB] px-5 py-4">
					<h1 className="text-lg font-bold text-[#1F2937]">채팅</h1>
					<p className="text-xs text-[#6B7280]">대화 {rooms.length}건</p>
				</div>
				<ChatRoomList rooms={rooms} basePath="/buyer/chat" />
			</aside>

			<div className="min-w-0 flex-1">{children}</div>
		</div>
	);
}