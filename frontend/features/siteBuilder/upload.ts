import { createClient } from "@/libs/supabase";

/**
 * 브라우저에서 직접 Storage 로 올린다. 경로 접두어가 사용자 id 라 정책의 근거가 된다.
 */
export async function uploadImage(
	file: File,
	bucket: "company-logos" | "product-images",
	folder: string,
): Promise<string> {
	const supabase = createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) throw new Error("로그인이 필요합니다.");

	const ext = file.name.split(".").pop();
	const path = `${user.id}/${folder}/${Date.now()}.${ext}`;

	const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
	if (error) throw new Error(error.message);

	const { data } = supabase.storage.from(bucket).getPublicUrl(path);
	return data.publicUrl;
}
