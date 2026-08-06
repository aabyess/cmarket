"use client";

import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "@/features/notifications/apis";

export const NOTIFICATION_QUERY_KEYS = {
	all: ["notifications"] as const,
};

export function useNotifications() {
	return useQuery({
		queryKey: NOTIFICATION_QUERY_KEYS.all,
		queryFn: getNotifications,
	});
}