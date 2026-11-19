import { getCurrentUser } from "@/lib/session";

export const fail = (message, errors = {}) => ({ ok: false, message, errors });
export const succeed = (message = "Saved.", extra = {}) => ({ ok: true, message, ...extra });

export function zodFieldErrors(error) {
  const out = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (key !== undefined && !out[key]) out[key] = issue.message;
  }
  return out;
}

/** Use at the top of every server action. */
export async function actionUser({ admin = false } = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: fail("Your session has expired. Please sign in again.") };
  if (admin && user.role !== "ADMIN") return { error: fail("Only administrators can do this.") };
  return { user };
}