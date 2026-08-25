// store/useToastStore.ts
import { create } from "zustand";

export type ToastVariant = "success" | "error";

export type Toast = {
	id: string;
	message: string;
	variant: ToastVariant;
};

type ToastStore = {
	toasts: Toast[];
	showToast: (message: string, variant?: ToastVariant) => void;
	dismissToast: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
	toasts: [],
	showToast: (message, variant = "success"): void =>
		set((state) => ({
			toasts: [...state.toasts, { id: crypto.randomUUID(), message, variant }],
		})),
	dismissToast: (id): void =>
		set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));
