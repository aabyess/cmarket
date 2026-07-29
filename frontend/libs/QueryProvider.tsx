"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { makeQueryClient } from "@/libs/queryClient";

type QueryProviderProps = {
	children: ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps): React.JSX.Element {
	const [queryClient] = useState(() => makeQueryClient());

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}