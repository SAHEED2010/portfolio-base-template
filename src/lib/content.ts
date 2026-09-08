import { selectRows } from "./db";

// Typed reads for the six content tables. Every fetch is ordered
// explicitly by display_order — without it PostgREST returns rows in
// whatever order Postgres feels like, which is not stable.

export type Skill = {
  id: string;
  name: string;
  display_order: number;
};

export type Experience = {
  id: string;
  title: string;
  org: string;
  logo_url: string | null;
  start_date: string;
  end_date: string | null;
  type: string | null;
  description: string | null;
  display_order: number;
};

export type Work = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  external_url: string;
  display_order: number;
};

export type Testimonial = {
  id: string;
  name: string;
  avatar_url: string | null;
  quote: string;
  rating: number | null;
  display_order: number;
};

export type Stat = {
  id: string;
  label: string;
  number: string;
  display_order: number;
};

const ordered = "select=*&order=display_order.asc";

export function getSkills() {
  return selectRows<Skill>("skills", ordered);
}

export function getExperiences() {
  return selectRows<Experience>("experiences", ordered);
}

export function getWorks() {
  return selectRows<Work>("works", ordered);
}

export function getTestimonials() {
  return selectRows<Testimonial>("testimonials", ordered);
}

export function getStats() {
  return selectRows<Stat>("stats", ordered);
}
