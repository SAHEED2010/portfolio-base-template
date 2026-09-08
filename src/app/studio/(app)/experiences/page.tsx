import type { Metadata } from "next";
import Link from "next/link";
import {
  StudioEmptyState,
  StudioPage,
  StudioPageHeader,
} from "@/components/studio/page-header";
import { ReorderControls } from "@/components/studio/reorder-controls";
import { DeleteButton } from "@/components/studio/row-actions";
import type { Experience } from "@/lib/content";
import { formatDateRange } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { deleteExperience, moveExperience } from "./actions";

export const metadata: Metadata = { title: "Experience" };

export default async function ExperiencesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("experiences")
    .select("*")
    .order("display_order", { ascending: true });
  const experiences = (data ?? []) as Experience[];

  return (
    <StudioPage>
      <StudioPageHeader
        eyebrow="Experience"
        title="Where you have been"
        description="The order here is the order visitors see — not the dates."
        actionHref="/studio/experiences/new"
        actionLabel="Add experience"
      />

      {experiences.length === 0 ? (
        <StudioEmptyState
          title="No experience yet."
          consequence="The Experience section stays hidden on your site until you add one."
        />
      ) : (
        <ul className="mt-10 flex flex-col gap-3">
          {experiences.map((item, index) => (
            <li
              key={item.id}
              className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-3"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100">
                {item.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.logo_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="font-display text-sm text-neutral-300"
                  >
                    {item.org.charAt(0).toUpperCase()}
                  </span>
                )}
              </span>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/studio/experiences/${item.id}`}
                  className="link-underline text-base font-medium text-primary hover:text-accent"
                >
                  {item.title}
                </Link>
                <p className="truncate text-sm text-neutral-500">
                  {item.org} · {formatDateRange(item.start_date, item.end_date)}
                </p>
              </div>

              <ReorderControls
                id={item.id}
                isFirst={index === 0}
                isLast={index === experiences.length - 1}
                action={moveExperience}
              />
              <DeleteButton
                id={item.id}
                label={item.title}
                action={deleteExperience}
              />
            </li>
          ))}
        </ul>
      )}
    </StudioPage>
  );
}
