export function countryToLocale(country: string | null | undefined): "ko" | "id" {
	return country === "korea" ? "ko" : "id";
}
