import type { Metadata } from "next";
import { StudioPage } from "@/components/studio/page-header";
import { createStat } from "../actions";
import { StatForm } from "../stat-form";

export const metadata: Metadata = { title: "Add stat" };

export default function NewStatPage() {
  return (
    <StudioPage>
      <h1 className="font-display text-3xl tracking-tight text-primary">
        Add stat
      </h1>
      <div className="mt-8">
        <StatForm action={createStat} />
      </div>
    </StudioPage>
  );
}
