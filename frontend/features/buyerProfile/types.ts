export type BuyerProfileData = {
	company: {
		companyName: string;
		representative: string;
		businessType: string;
		address: string;
	};
	profile: {
		logoUrl: string | null;
		description: string | null;
		establishedYear: number | null;
		employeeCount: string | null;
		websiteUrl: string | null;
		certifications: string[];
	} | null;
};