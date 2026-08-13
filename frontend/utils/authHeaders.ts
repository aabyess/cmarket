// utils/authHeaders.ts
import { headers } from "next/headers";

const VALID_ROLES = ["buyer", "seller", "admin"] as const;

export type AuthHeaderUser = {
	userId: string;
	email: string;
	role: (typeof VALID_ROLES)[number];
};

function isValidRole(value: string): value is AuthHeaderUser["role"] {
	return (VALID_ROLES as readonly string[]).includes(value);
}

/** 미들웨어가 이미 검증해 헤더로 전달한 사용자 정보. 미들웨어를 거치지 않은 요청(예: 공개 페이지)이거나 값이 이상하면 null. */
export async function getAuthHeaders(): Promise<AuthHeaderUser | null> {
	const headerList = await headers();
	const userId = headerList.get("x-user-id");
	const role = headerList.get("x-user-role");
	if (!userId || !role || !isValidRole(role)) return null;

	return {
		userId,
		email: headerList.get("x-user-email") ?? "",
		role,
	};
}
