// features/verification/types.ts
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";
export type VerificationMethod = "nts_api" | "manual_document";

export type CompanyVerification = {
	status: VerificationStatus;
	method: VerificationMethod | null;
	verifiedAt: string | null;
	documentUrl: string | null;
	note: string | null;
	requestedAt: string | null;
};

export type VerificationQueueItem = {
	profileId: string;
	companyName: string;
	country: "korea" | "indonesia" | null;
	businessNumber: string | null;
	nib: string | null;
	status: VerificationStatus;
	method: VerificationMethod | null;
	documentUrl: string | null;
	requestedAt: string | null;
	note: string | null;
};
