// i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	locales: ["ko", "id", "en"],
	defaultLocale: "ko",
	localePrefix: "as-needed",
});
