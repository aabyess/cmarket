import { KOREA_TERMS } from "@/features/auth/termsKorea";
import { INDONESIA_TERMS } from "@/features/auth/termsIndonesia";

export type SignupCountry = "korea" | "indonesia";

export type TermSection = {
	heading: string;
	/** 문단 또는 목록 항목. 줄바꿈은 배열 원소로 나눈다. */
	body: string[];
};

export type TermTable = {
	heading: string;
	columns: string[];
	rows: string[][];
};

export type TermDocument = {
	id: string;
	label: string;
	required: boolean;
	/** 개정 시 올린다. 동의 이력에 함께 남겨야 어느 판본에 동의했는지 알 수 있다. */
	version: string;
	effectiveDate: string;
	summary: string;
	sections: TermSection[];
	tables?: TermTable[];
	/** 필수 동의 항목은 거부 시 결과를, 선택 항목은 거부해도 불이익이 없음을 반드시 적는다. */
	refusalNotice: string;
};

export const TERMS_UI_TEXT: Record<
	SignupCountry,
	{
		title: string;
		subtitle: string;
		agreeAll: string;
		required: string;
		optional: string;
		next: string;
		back: string;
		close: string;
		effective: string;
		version: string;
	}
> = {
	korea: {
		title: "약관 동의",
		subtitle: "회원가입을 위해 이용약관에 동의해 주세요.",
		agreeAll: "전체 동의",
		required: "[필수]",
		optional: "[선택]",
		next: "다음으로 넘어가기",
		back: "이전",
		close: "닫기",
		effective: "시행일",
		version: "버전",
	},
	indonesia: {
		title: "Persetujuan Syarat dan Ketentuan",
		subtitle: "Untuk mendaftar, mohon setujui ketentuan berikut.",
		agreeAll: "Setujui semua",
		required: "[Wajib]",
		optional: "[Opsional]",
		next: "Lanjutkan",
		back: "Kembali",
		close: "Tutup",
		effective: "Berlaku sejak",
		version: "Versi",
	},
};

export function getTerms(country: SignupCountry): TermDocument[] {
	return country === "korea" ? KOREA_TERMS : INDONESIA_TERMS;
}

export function isSignupCountry(value: string | null): value is SignupCountry {
	return value === "korea" || value === "indonesia";
}
