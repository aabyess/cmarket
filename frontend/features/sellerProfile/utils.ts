import { createClient } from "@/libs/supabase";

export async function uploadImage(
	file: File,
	bucket: "company-logos" | "product-images",
	folder: string,
): Promise<string> {
	const supabase = createClient();

	const { data: { user } } = await supabase.auth.getUser();
	if (!user) throw new Error("로그인이 필요합니다.");

	const ext = file.name.split(".").pop();
	const path = `${user.id}/${folder}/${Date.now()}.${ext}`;

	const { error } = await supabase.storage.from(bucket).upload(path, file, {
		upsert: true,
	});

	if (error) throw new Error(error.message);

	const { data } = supabase.storage.from(bucket).getPublicUrl(path);
	return data.publicUrl;
}