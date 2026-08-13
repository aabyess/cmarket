import { createServerSupabaseClient } from "@/libs/supabaseServer"; // 실제 경로로

export default async function TestDemoPage() {
  const supabase = await createServerSupabaseClient("demo");
  const { data, error } = await supabase.from("tenant").select("name, slug");

  return (
    <pre>
      {JSON.stringify({ data, error }, null, 2)}
    </pre>
  );
}