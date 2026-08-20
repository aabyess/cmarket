// utils/parseJsonBody.ts
import type { NextRequest } from "next/server";

// 비어 있거나 깨진 요청 body로 req.json()을 호출하면 예외가 던져져 잡히지 않으면 500이 된다.
// 실패 시 null을 반환해 호출부가 400으로 응답할 수 있게 한다.
export async function parseJsonBody<T>(req: NextRequest): Promise<T | null> {
	try {
		return (await req.json()) as T;
	} catch {
		return null;
	}
}
