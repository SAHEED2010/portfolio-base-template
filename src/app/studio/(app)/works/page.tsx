import type { Metadata } from "next";
import Link from "next/link";
import {
  StudioEmptyState,
  StudioPage,
  StudioPageHeader,
} from "@/components/studio/page-header";
import { ReorderControls } from "@/components/studio/reorder-controls";
import { DeleteButton } from "@/components/studio/row-actions";
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
    <StudioPage>
      <StudioPageHeader
        eyebrow="Works"
        title="Selected work"
        description="The order here is the order visitors see."
        actionHref="/studio/works/new"
        actionLabel="Add work"
      />

      {works.length === 0 ? (
        <StudioEmptyState
          title="No works yet."
          consequence="The Work section stays hidden on your site until you add one."
        />
      ) : (
        <ul className="mt-10 flex flex-col gap-3">
          {works.map((work, index) => (
            <li
              key={work.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-surface p-3"
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
                  className="link-underline text-base font-medium text-ink hover:text-accent"
                >
                  {work.title}
                </Link>
                {work.subtitle && (
                  <p className="truncate text-sm text-muted">
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

              <DeleteButton
                id={work.id}
                label={work.title}
                action={deleteWork}
              />
            </li>
          ))}
        </ul>
      )}
    </StudioPage>
  );
}
