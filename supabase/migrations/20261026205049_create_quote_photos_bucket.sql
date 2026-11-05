-- Private storage for customer quote attachments.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quote-photos',
  'quote-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;
