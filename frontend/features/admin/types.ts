// features/admin/types.ts
import type { Plan } from "@/constants/plan";

export type AdminUserRole = "buyer" | "seller" | "admin";
export type AdminUserCountry = "korea" | "indonesia" | null;

export type AdminUser = {
	id: string;
	role: AdminUserRole;
	country: AdminUserCountry;
	plan: Plan;
	createdAt: string;
	username: string;
	companyName: string;
	representative: string;
};
