-- Storage: single `media` bucket for all images (portraits, work
-- images, testimonial avatars). Path/filename encodes which — one
-- bucket keeps policy surface small.
--
-- Defined as a migration rather than in config.toml on purpose:
-- config.toml buckets are local-dev only, and this base is forked to
-- real Supabase projects, so the bucket must be reproducible there.

insert into storage.buckets
  (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,               -- public read: images are served straight from
                      -- the public object URL, no signing step
  2097152,            -- 2 MiB. Defence in depth: the browser-side
                      -- compression cap rejects oversize files with a
                      -- friendly error; this rejects them even if that
                      -- layer is bypassed.
  array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]                   -- no image/svg+xml (XSS risk on user upload),
                      -- no image/gif (large, animated, rarely wanted)
);

-- RLS on storage.objects is enabled by Supabase already; these
-- policies scope access to this bucket, mirroring the six
-- public-read tables: anyone reads, only authenticated writes.

create policy "media_public_select"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

create policy "media_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

create policy "media_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media')
  with check (bucket_id = 'media');

create policy "media_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');
