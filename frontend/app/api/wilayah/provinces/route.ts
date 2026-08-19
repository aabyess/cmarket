import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
	try {
		const res = await fetch("https://wilayah.id/api/provinces.json", { next: { revalidate: 86400 } });
		if (!res.ok) throw new Error("failed to fetch provinces");
		const data = await res.json();
		return NextResponse.json(data);
	} catch (err) {
		console.error(err);
		return NextResponse.json({ error: "주(Provinsi) 목록을 불러오지 못했습니다." }, { status: 502 });
	}
}