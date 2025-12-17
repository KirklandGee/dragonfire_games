export function isAdmin(userId?: string | null): boolean {
  if (!userId) return false;
  const allowlist = process.env.CLERK_ADMIN_USER_IDS;
  if (!allowlist) return false;
  return allowlist.split(",").map((id) => id.trim()).filter(Boolean).includes(userId);
}
