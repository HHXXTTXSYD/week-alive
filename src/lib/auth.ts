import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { ActionError } from "./action-error";
export async function authClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )
    return null;
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll(values) {
          try {
            values.forEach(({ name, value, options }) =>
              store.set(name, value, options),
            );
          } catch {
            /* Server Components are read-only; proxy refreshes cookies. */
          }
        },
      },
    },
  );
}
export async function currentUser() {
  const client = await authClient();
  return client ? (await client.auth.getUser()).data.user : null;
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new ActionError("请先登录后再操作");
  return user;
}
export function isAdmin(id: string) {
  return (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map((v) => v.trim())
    .includes(id);
}
