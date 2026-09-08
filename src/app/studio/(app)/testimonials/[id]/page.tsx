import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudioPage } from "@/components/studio/page-header";
import type { Testimonial } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import { updateTestimonial } from "../actions";
import { TestimonialForm } from "../testimonial-form";

export const metadata: Metadata = { title: "Edit testimonial" };

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return (
    <StudioPage>
      <h1 className="font-display text-3xl tracking-tight text-primary">
        Edit testimonial
      </h1>
      <div className="mt-8">
        <TestimonialForm
          testimonial={data as Testimonial}
          action={updateTestimonial}
        />
      </div>
    </StudioPage>
  );
}
