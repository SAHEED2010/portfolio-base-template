import type { Metadata } from "next";
import Link from "next/link";
import { ReorderControls } from "@/components/studio/reorder-controls";
import type { Work } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import { deleteWork, moveWork } from "./actions";

export const metadata: Metadata = { title: "Works" };

export default async function WorksPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("works")
    .select("*")
    .order("display_order", { ascending: true });

  const works = (data ?? []) as Work[];

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-px w-8 bg-accent" />
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
              Works
            </p>
          </div>
          <h1 className="font-display mt-5 text-3xl tracking-tight text-primary">
            Selected work
          </h1>
          <p className="mt-2 max-w-xl text-base text-neutral-600">
            The order here is the order visitors see.
          </p>
        </div>

        <Link
          href="/studio/works/new"
          className="tap inline-flex min-h-11 items-center rounded-full bg-accent px-6 text-sm font-medium text-neutral-50 transition-colors hover:bg-accent-hover"
        >
          Add work
        </Link>
      </div>

      {works.length === 0 ? (
        // Empty state matters here: an empty table hides the whole
        // section on the public site, and the client should know that
        // rather than wonder where it went.
        <div className="mt-10 rounded-xl border border-dashed border-neutral-300 p-10 text-center">
          <p className="text-base text-neutral-600">No works yet.</p>
          <p className="mt-1 text-sm text-neutral-500">
            The Work section stays hidden on your site until you add one.
          </p>
        </div>
      ) : (
        <ul className="mt-10 flex flex-col gap-3">
          {works.map((work, index) => (
            <li
              key={work.id}
              className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-3"
            >
              <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                {work.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={work.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span
                      aria-hidden
                      className="font-display text-xl text-neutral-300"
                    >
                      {work.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/studio/works/${work.id}`}
                  className="link-underline text-base font-medium text-primary hover:text-accent"
                >
                  {work.title}
                </Link>
                {work.subtitle && (
                  <p className="truncate text-sm text-neutral-500">
                    {work.subtitle}
                  </p>
                )}
              </div>

              <ReorderControls
                id={work.id}
                isFirst={index === 0}
                isLast={index === works.length - 1}
                action={moveWork}
              />

              <form action={deleteWork}>
                <input type="hidden" name="id" value={work.id} />
                <button
                  type="submit"
                  aria-label={`Delete ${work.title}`}
                  className="tap flex h-9 items-center rounded-lg px-3 text-sm text-neutral-500 transition-colors hover:text-red-700"
                >
                  Delete
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
