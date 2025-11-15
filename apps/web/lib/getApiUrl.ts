export function getApiUrl() {
  const host = process.env.NEXT_PUBLIC_API_HOST; // e.g. "ethos-api-vbj7"
  console.log("checkk host", host)
  if (process.env.NODE_ENV === "production") {
    return `https://${host}.onrender.com`;
  }
  return host;
}