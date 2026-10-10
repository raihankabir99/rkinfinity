# Media Library V2

Use the existing Supabase Storage project as the source of truth.

## Safety rules
- Do not assume or create a bucket without inspecting existing buckets first.
- Do not delete or overwrite existing assets automatically.
- Keep public URLs compatible with existing cover_url values.
- Admin-only upload/manage operations.
- Validate file size and MIME type before upload.

## Target UX
- Grid/list toggle
- Search and filters
- Image preview
- Copy public URL
- Reuse asset in Blog
- Upload progress
- Empty/loading/error states
- Mobile responsive layout

Implementation should be additive and should not alter existing blog post records.
