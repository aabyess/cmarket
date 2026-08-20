import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ code: string }> };

export async function GET(_request: NextRequest, { params }: Params): Promise<NextResponse> {
	const { code } = await params;

	try {
		const res = await fetch(`https://wilayah.id/api/regencies/${code}.json`, { next: { revalidate: 86400 } });
		if (!res.ok) throw new Error("failed to fetch regencies");
		const data = await res.json();
		return NextResponse.json(data);
	} catch (err) {
		console.error(err);
		return NextResponse.json({ error: "시/군(Kota) 목록을 불러오지 못했습니다." }, { status: 502 });
	}
}