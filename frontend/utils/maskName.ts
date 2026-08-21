// utils/maskName.ts

/** 앞 절반은 보여주고 나머지는 "*"로 가린다. 1자면 "*" 하나로. 유니코드 코드포인트 기준. */
export function maskName(name: string): string {
	if (!name) return name;

	const chars = [...name];
	if (chars.length === 1) return "*";

	const visibleCount = Math.ceil(chars.length / 2);
	return chars.map((char, i) => (i < visibleCount ? char : "*")).join("");
}
