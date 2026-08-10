export type CompanyProfile = {
	id: string;
	profileId: string;
	logoUrl: string | null;
	description: string | null;
	establishedYear: number | null;
	employeeCount: string | null;
	certifications: string[];
	websiteUrl: string | null;
	categories: string[];
};

export type Product = {
	id: string;
	profileId: string;
	name: string;
	description: string | null;
	imageUrls: string[];
	catalogUrl: string | null;
	priceRange: string | null;
	sortOrder: number;
};

export type BankAccount = {
	id: string | null;
	bankName: string;
	accountNumber: string;
	accountHolder: string;
	swiftCode: string;
	currency: string;
};

export type SellerProfileData = {
	company: {
		companyName: string;
		businessType: string;
		businessItem: string;
		representative: string;
		address: string;
		businessNumber: string;
	};
	profile: CompanyProfile | null;
	products: Product[];
	bankAccount: BankAccount | null;
};