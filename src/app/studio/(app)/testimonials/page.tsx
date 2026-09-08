import type { Metadata } from "next";
import Link from "next/link";
import {
  StudioEmptyState,
  StudioPage,
  StudioPageHeader,
} from "@/components/studio/page-header";
import { ReorderControls } from "@/components/studio/reorder-controls";
import { DeleteButton } from "@/components/studio/row-actions";
import type { Testimonial } from "@/lib/content";
import { initialsFrom } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { deleteTestimonial, moveTestimonial } from "./actions";

export const metadata: Metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .order("display_order", { ascending: true });
  const testimonials = (data ?? []) as Testimonial[];

  return (
    <StudioPage>
      <StudioPageHeader
        eyebrow="Testimonials"
        title="Kind words"
        description="The order here is the order they scroll past."
        actionHref="/studio/testimonials/new"
        actionLabel="Add testimonial"
      />

      {testimonials.length === 0 ? (
        <StudioEmptyState
          title="No testimonials yet."
          consequence="The Testimonials section stays hidden on your site until you add one."
        />
      ) : (
        <ul className="mt-10 flex flex-col gap-3">
          {testimonials.map((item, index) => (
            <li
              key={item.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-surface p-3"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100">
                {item.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.avatar_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span aria-hidden className="text-xs text-neutral-400">
                    {initialsFrom(item.name)}
                  </span>
                )}
              </span>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/studio/testimonials/${item.id}`}
                  className="link-underline text-base font-medium text-ink hover:text-accent"
                >
                  {item.name}
                </Link>
                <p className="truncate text-sm text-muted">{item.quote}</p>
              </div>

              {/* Surfaced in the list because "no rating" is a valid,
                  deliberate state — not a missing value to fix. */}
              <span className="hidden shrink-0 text-xs tabular-nums text-neutral-400 sm:block">
                {item.rating === null ? "no rating" : `${item.rating}/5`}
              </span>

              <ReorderControls
                id={item.id}
                isFirst={index === 0}
                isLast={index === testimonials.length - 1}
                action={moveTestimonial}
              />
              <DeleteButton
                id={item.id}
                label={item.name}
                action={deleteTestimonial}
              />
            </li>
          ))}
        </ul>
      )}
    </StudioPage>
  );
}
