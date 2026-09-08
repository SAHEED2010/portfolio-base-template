import type { Metadata } from "next";
import { StudioPage } from "@/components/studio/page-header";
import { createTestimonial } from "../actions";
import { TestimonialForm } from "../testimonial-form";

export const metadata: Metadata = { title: "Add testimonial" };

export default function NewTestimonialPage() {
  return (
    <StudioPage>
      <h1 className="font-display text-3xl tracking-tight text-primary">
        Add testimonial
      </h1>
      <div className="mt-8">
        <TestimonialForm action={createTestimonial} />
      </div>
    </StudioPage>
  );
}
