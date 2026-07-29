import { createServerSupabaseClient } from "@/libs/supabaseServer";

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("_test").select().limit(1);

  return (
    <div>
      {error?.message.includes("Could not find the table")
        ? "✅ Supabase 연결 성공"
        : `❌ 연결 실패: ${error?.message}`}
    </div>
  );
}