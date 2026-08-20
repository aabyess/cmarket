// app/[locale]/terms/page.tsx
import { LegalPageLayout } from "@/features/legal/components/LegalPageLayout";
import { TermsContent } from "@/features/legal/components/TermsContent";

export default function TermsPage(): React.ReactNode {
	return (
		<LegalPageLayout title="이용약관">
			<TermsContent />
		</LegalPageLayout>
	);
}
