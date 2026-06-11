/**
 * Logical upload folders the API accepts. Keeping this whitelist in one place
 * prevents callers from writing to arbitrary paths in the bucket.
 */
export const ALLOWED_UPLOAD_FOLDERS = [
  'avatars',
  'documents',
  'feedback',
  'notifications',
  'id-cards',
  'news',
  'events',
  'misc',
] as const;

export type UploadFolder = (typeof ALLOWED_UPLOAD_FOLDERS)[number];
