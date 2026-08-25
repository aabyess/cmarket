// utils/downloadCsv.ts

// 회사명 등 사용자 입력값이 셀에 그대로 들어가므로, =/+/-/@로 시작하는 값은 엑셀이
// 수식으로 실행할 수 있는 CSV 인젝션 위험이 있다. 앞에 작은따옴표를 붙여 무력화한다.
function escapeCell(value: string): string {
	const safeValue = /^[=+\-@]/.test(value) ? `'${value}` : value;
	if (/[",\n]/.test(safeValue)) {
		return `"${safeValue.replace(/"/g, '""')}"`;
	}
	return safeValue;
}

/** headers/rows로 CSV 문자열을 만들어 파일 다운로드를 트리거한다. */
export function downloadCsv(filename: string, headers: string[], rows: string[][]): void {
	const csvContent = [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n");
	// UTF-8 BOM을 붙여야 엑셀에서 한글이 깨지지 않는다.
	const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
