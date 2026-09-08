import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  // The studio must never appear in search results. Obscurity isn't
  // the security layer — RLS is — but there's no reason to index it.
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="flex min-h-[100svh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-8 bg-accent" />
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
            Studio
          </p>
        </div>

        <h1 className="font-display mt-5 text-3xl tracking-tight text-primary">
          Sign in
        </h1>
        <p className="mt-2 text-base text-neutral-600">
          Manage your site’s content.
        </p>

        <div className="mt-8">
          <LoginForm next={next ?? "/studio"} />
        </div>

        {/* There is no self-serve reset in V1, so saying so is kinder
            than a dead "forgot password?" link. */}
        <p className="mt-8 text-sm text-neutral-500">
          Lost your password? There’s no self-serve reset — contact your
          site administrator and they’ll issue a new one.
        </p>
      </div>
    </main>
  );
}
