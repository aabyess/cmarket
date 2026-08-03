"use client";

import { useMutation } from "@tanstack/react-query";
import { postLogin, postLogout, signupIndonesia, signupKorea } from "@/features/auth/apis";
export function useLogin() {
	return useMutation({ mutationFn: postLogin });
}

export function useLogout() {
	return useMutation({ mutationFn: postLogout });
}

export function useSignupIndonesia() {
	return useMutation({ mutationFn: signupIndonesia });
}

export function useSignupKorea() {
	return useMutation({ mutationFn: signupKorea });
}