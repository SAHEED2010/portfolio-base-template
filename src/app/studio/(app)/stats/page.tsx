import type { Metadata } from "next";
import Link from "next/link";
import {
  StudioEmptyState,
  StudioPage,
  StudioPageHeader,
} from "@/components/studio/page-header";
import { ReorderControls } from "@/components/studio/reorder-controls";
import { DeleteButton } from "@/components/studio/row-actions";
import type { Stat } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import { deleteStat, moveStat } from "./actions";

export const metadata: Metadata = { title: "Stats" };

export default async function StatsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stats")
    .select("*")
    .order("display_order", { ascending: true });
  const stats = (data ?? []) as Stat[];

  return (
    <StudioPage>
      <StudioPageHeader
        eyebrow="Stats"
        title="Numbers"
        description="Shown as a row beneath your About section."
        actionHref="/studio/stats/new"
        actionLabel="Add stat"
      />

      {stats.length === 0 ? (
        <StudioEmptyState
          title="No stats yet."
          consequence="The stats row stays hidden on your site until you add one."
        />
      ) : (
        <ul className="mt-10 flex flex-col gap-3">
          {stats.map((stat, index) => (
            <li
              key={stat.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-surface p-3"
            >
              <span className="font-display w-16 shrink-0 pl-1 text-2xl tracking-tight text-ink">
                {stat.number}
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/studio/stats/${stat.id}`}
                  className="link-underline text-base text-muted hover:text-accent"
                >
                  {stat.label}
                </Link>
              </div>
              <ReorderControls
                id={stat.id}
                isFirst={index === 0}
                isLast={index === stats.length - 1}
                action={moveStat}
              />
              <DeleteButton id={stat.id} label={stat.label} action={deleteStat} />
            </li>
          ))}
        </ul>
      )}
    </StudioPage>
  );
}
