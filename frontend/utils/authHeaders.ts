// utils/authHeaders.ts
import { headers } from "next/headers";

export type AuthHeaderUser = {
	userId: string;
	email: string;
	role: "buyer" | "seller" | "admin";
};

/** 미들웨어가 이미 검증해 헤더로 전달한 사용자 정보. 미들웨어를 거치지 않은 요청(예: 공개 페이지)에서는 null. */
export async function getAuthHeaders(): Promise<AuthHeaderUser | null> {
	const headerList = await headers();
	const userId = headerList.get("x-user-id");
	const role = headerList.get("x-user-role");
	if (!userId || !role) return null;

	return {
		userId,
		email: headerList.get("x-user-email") ?? "",
		role: role as AuthHeaderUser["role"],
	};
}
