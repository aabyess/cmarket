export type WilayahOption = {
	code: string;
	name: string;
};

export async function getProvinces(): Promise<WilayahOption[]> {
	const res = await fetch("/api/wilayah/provinces");
	if (!res.ok) throw new Error("주(Provinsi) 목록을 불러오지 못했습니다.");
	const { data } = await res.json();
	return data;
}

export async function getRegencies(provinceCode: string): Promise<WilayahOption[]> {
	const res = await fetch(`/api/wilayah/regencies/${provinceCode}`);
	if (!res.ok) throw new Error("시/군(Kota) 목록을 불러오지 못했습니다.");
	const { data } = await res.json();
	return data;
}