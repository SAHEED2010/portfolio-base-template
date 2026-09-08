import type { Metadata } from "next";
import { createWork } from "../actions";
import { WorkForm } from "../work-form";

export const metadata: Metadata = { title: "Add work" };

export default function NewWorkPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 lg:px-10 lg:py-14">
      <h1 className="font-display text-3xl tracking-tight text-ink">
        Add work
      </h1>
      <div className="mt-8">
        <WorkForm action={createWork} />
      </div>
    </div>
  );
}
