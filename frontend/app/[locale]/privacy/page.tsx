// app/[locale]/privacy/page.tsx
import { LegalPageLayout } from "@/features/legal/components/LegalPageLayout";
import { PrivacyContent } from "@/features/legal/components/PrivacyContent";

export default function PrivacyPage(): React.ReactNode {
	return (
		<LegalPageLayout title="개인정보 처리방침">
			<PrivacyContent />
		</LegalPageLayout>
	);
}
