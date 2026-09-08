"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Zod v4 API throughout:
//   - z.email() as a top-level format, not z.string().email()
//   - `error` for custom messages, not `message`/`errorMap`
//   - z.flattenError(err) for field errors, not err.flatten()

const LoginSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }),
  password: z.string().min(1, { error: "Enter your password." }),
});

export type LoginState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
};

export async function signIn(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Deliberately vague: distinguishing "no such user" from "wrong
    // password" tells an attacker which emails have accounts.
    return {
      status: "error",
      message: "Those details didn't match. Check and try again.",
    };
  }

  const next = String(formData.get("next") ?? "/studio");
  // Only same-origin relative paths — an attacker-supplied absolute
  // URL here would turn login into an open redirect.
  const safeNext = next.startsWith("/studio") ? next : "/studio";

  redirect(safeNext);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/studio/login");
}
