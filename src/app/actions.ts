"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

// Server action — the "use server" directive means this function
// never ships to the browser; the form posts to it directly. This is
// why there's no API route: writes go through server actions
// (CLAUDE.md, Stack).

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "message", string>>;
};

// Pragmatic, not RFC-complete: rejects obvious typos without
// rejecting valid addresses that a stricter pattern would.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Stored hashed, never raw — still useful for spotting repeat
// submissions without holding raw PII (DECISIONS.md, Schema details).
function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  // Re-validated on the server: the client checks are for feedback
  // speed, but they're trivially bypassed.
  const fieldErrors: ContactFormState["fieldErrors"] = {};
  if (!name) fieldErrors.name = "Please enter your name.";
  if (!email) fieldErrors.email = "Please enter your email.";
  else if (!EMAIL_PATTERN.test(email))
    fieldErrors.email = "That doesn't look like a valid email.";
  if (!message) fieldErrors.message = "Please enter a message.";

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", fieldErrors };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    console.error("[contact] Supabase env vars missing");
    return {
      status: "error",
      message: "Something went wrong on our end. Please try again later.",
    };
  }

  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();

  try {
    const res = await fetch(`${url}/rest/v1/contact_messages`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        message,
        ip_address: ip ? hashIp(ip) : null,
      }),
      // Do NOT add `Prefer: return=representation` here. It makes
      // PostgREST read the new row back, and anon has INSERT but no
      // SELECT on this table — so the whole request 401s with
      // "new row violates row-level security policy". Verified.
      // A contact form must never be served from cache.
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`[contact] HTTP ${res.status}: ${await res.text()}`);
      return {
        status: "error",
        message: "Your message couldn't be sent. Please try again.",
      };
    }
  } catch (error) {
    console.error("[contact] request failed", error);
    return {
      status: "error",
      message: "Your message couldn't be sent. Please try again.",
    };
  }

  return { status: "success" };
}
