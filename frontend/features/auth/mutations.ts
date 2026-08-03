"use client";

import { useMutation } from "@tanstack/react-query";
import { postLogin, postLogout, signupIndonesia } from "@/features/auth/apis";

export function useLogin() {
	return useMutation({ mutationFn: postLogin });
}

export function useLogout() {
	return useMutation({ mutationFn: postLogout });
}

export function useSignupIndonesia() {
	return useMutation({ mutationFn: signupIndonesia });
}