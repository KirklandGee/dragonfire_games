import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type ClientRole = "anon" | "service";

const getUrl = () =>
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";

const getKey = (role: ClientRole) => {
  if (role === "service") {
    return (
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.SUPABASE_SECRET_KEY ??
      ""
    );
  }
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    ""
  );
};

export function getSupabaseClient(
  role: ClientRole = "anon",
): SupabaseClient | null {
  const url = getUrl();
  const key = getKey(role);

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}
