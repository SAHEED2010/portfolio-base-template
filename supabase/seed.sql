-- Seed content for the BASE template.
--
-- Written as a coherent creative-professional persona rather than
-- "Sample 1 / Sample 2" so the base reads as a real portfolio on
-- first load and its design can actually be judged. Every fork
-- overwrites all of this — see DECISIONS.md (Product shape).
--
-- Runs automatically on `supabase db reset`.

-- ---------------------------------------------------------------
-- site_settings — ALL display copy. Nothing here is hardcoded in a
-- component. `value` is jsonb: strings for copy, arrays for lists.
-- ---------------------------------------------------------------
insert into public.site_settings (key, value) values
  -- identity
  ('site_title',            '"Mara Ellison"'),
  ('site_tagline',          '"Independent designer and maker"'),
  ('seo_description',       '"Portfolio of Mara Ellison — independent designer working across brand, product and print."'),

  -- hero
  ('hero_greeting',         '"Hello, I''m"'),
  ('hero_name',             '"Mara Ellison"'),
  ('hero_phrases',          '["I design things people actually use.", "I turn vague ideas into clear ones.", "I make brands feel like themselves.", "I sweat the details nobody notices."]'),
  ('hero_intro',            '"An independent designer working across brand, product and print — currently taking on selected projects."'),
  ('hero_cta_primary',      '"Start a project"'),
  ('hero_cta_secondary',    '"See selected work"'),
  -- Empty by default: the base ships no binary assets, so the hero
  -- renders a typographic placeholder until a fork uploads a portrait.
  ('hero_portrait_url',     '""'),

  -- section labels: what each section is CALLED for this client.
  -- A fork renames "Works" to "Publications" or "Cases" here, with
  -- no migration and no code change. The nav reads these too.
  ('label_about',           '"About"'),
  ('label_skills',          '"Skills"'),
  ('label_experiences',     '"Experience"'),
  ('label_works',           '"Work"'),
  ('label_testimonials',    '"Testimonials"'),
  ('label_contact',         '"Contact"'),

  -- section headings + intros
  ('about_heading',         '"A designer who likes the awkward middle of a problem"'),
  ('about_intro',           '"I''ve spent the last decade helping small teams find the shape of what they''re building. Most of that work happens before anything looks like design — in the questions, the constraints, and the things nobody wants to say out loud."'),
  ('skills_heading',        '"What I work with"'),
  ('skills_intro',          '"Tools change. The habit of asking better questions doesn''t."'),
  ('experiences_heading',   '"Where I''ve been"'),
  ('experiences_intro',     '"A decade of studios, in-house teams, and the occasional useful detour."'),
  ('works_heading',         '"Selected work"'),
  ('works_intro',           '"A few projects that show how I think, not just what I shipped."'),
  ('testimonials_heading',  '"Kind words"'),
  ('testimonials_intro',    '"The people I''ve worked alongside, in their own words."'),
  ('contact_heading',       '"Let''s talk about it"'),
  ('contact_intro',         '"Tell me what you''re working on. I read everything and reply within a couple of days."'),
  ('contact_email',         '"hello@example.com"'),
  ('contact_location',      '"Lisbon, Portugal"'),
  -- Direct-message channels. Same shape as social_links plus an
  -- optional "primary": true, which picks the one filled button.
  -- A fork swaps these for its own; nothing here is hardcoded.
  ('contact_channels',      '[{"label": "Message on WhatsApp", "url": "https://wa.me/15550000000", "primary": true}, {"label": "Email", "url": "mailto:hello@example.com"}, {"label": "Telegram", "url": "https://t.me/example"}]'),
  ('contact_form_label',    '"Prefer to write something longer? Send it here and it lands in my inbox."'),
  ('contact_submit_label',  '"Send message"'),

  -- social
  ('social_links',          '[{"label": "LinkedIn", "url": "https://example.com"}, {"label": "Instagram", "url": "https://example.com"}, {"label": "Are.na", "url": "https://example.com"}]'),

  -- footer
  ('footer_note',           '"Built with care. Available for selected projects."');

-- ---------------------------------------------------------------
-- skills
-- ---------------------------------------------------------------
insert into public.skills (name, display_order) values
  ('Brand identity',        1),
  ('Product design',        2),
  ('Design systems',        3),
  ('Art direction',         4),
  ('Typography',            5),
  ('Print & editorial',     6),
  ('Prototyping',           7),
  ('Workshop facilitation', 8);

-- ---------------------------------------------------------------
-- experiences — end_date null means "Present"
-- ---------------------------------------------------------------
insert into public.experiences
  (title, org, start_date, end_date, type, description, display_order) values
  ('Independent Designer', 'Self-employed', '2021-03-01', null, 'work',
   'Brand and product work for small teams — usually from first conversation to shipped system.', 1),
  ('Senior Designer', 'Northbound Studio', '2018-01-01', '2021-02-01', 'work',
   'Led identity and digital work for cultural and education clients. Built the studio''s first design system.', 2),
  ('Designer', 'Field & Form', '2015-06-01', '2017-12-01', 'work',
   'Editorial and packaging design across print and screen. Learned to defend a layout in a room full of opinions.', 3),
  ('BA, Graphic Design', 'Central Institute of Art', '2011-09-01', '2015-05-01', 'education',
   'Focus on typography and print production.', 4);

-- ---------------------------------------------------------------
-- works — each links out; no detail pages in V1
-- ---------------------------------------------------------------
insert into public.works (title, subtitle, external_url, display_order) values
  ('Meridian',      'Identity and design system for a research collective', 'https://example.com', 1),
  ('Slow Press',    'Editorial design for an independent quarterly',        'https://example.com', 2),
  ('Harbour',       'Product design for a coastal logistics tool',          'https://example.com', 3),
  ('Fold',          'Packaging and art direction for a ceramics studio',    'https://example.com', 4),
  ('Common Ground', 'Wayfinding for a community arts centre',               'https://example.com', 5),
  ('Ledger',        'Interface work for a small accounting team',           'https://example.com', 6);

-- ---------------------------------------------------------------
-- testimonials — rating is nullable; the last one has none on
-- purpose, so the base proves it renders without stars.
-- ---------------------------------------------------------------
insert into public.testimonials (name, quote, rating, display_order) values
  ('Priya Raman',   'Mara asked the question everyone had been avoiding for six months, and the project got simpler that afternoon.', 5, 1),
  ('Tomas Beier',   'The system she built is still the thing our team argues least about. That is the highest praise I have.',        5, 2),
  ('Aoife Donnelly','Careful, fast, and honest about tradeoffs. She told us not to build something once, and she was right.',         5, 3),
  ('Julian Mbeki',  'Working with Mara felt less like hiring a designer and more like adding someone who cared about the outcome.', null, 4);

-- ---------------------------------------------------------------
-- stats — free text, so "10+" and "40" coexist
-- ---------------------------------------------------------------
insert into public.stats (label, number, display_order) values
  ('Years designing',    '10+',  1),
  ('Projects shipped',   '40',   2),
  ('Teams supported',    '18',   3),
  ('Repeat clients',     '70%',  4);
