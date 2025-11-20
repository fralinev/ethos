export function getApiUrl() {
  const host = process.env.NEXT_PUBLIC_API_HOST;
  if (process.env.NODE_ENV === "production") {
    return `https://${host}.onrender.com`;
  }
  return host;
}