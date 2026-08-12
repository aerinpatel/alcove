/**
 * Utility function to convert relative S3 keys or URLs into full loadable image URLs
 */
export function getAvatarUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // If it's already a full HTTP/HTTPS/data URL, return as is
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  // Construct full public S3 URL for relative keys (e.g. avatars/xxx.png or libraries/xxx.png)
  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || "studyspace-photos";
  const region = process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1";
  const cleanKey = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;

  return `https://${bucket}.s3.${region}.amazonaws.com/${cleanKey}`;
}
