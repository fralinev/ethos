
const API_BASE_URL = process.env.API_BASE_URL

export async function GET() {
  const response = await fetch(`${API_BASE_URL}/health`, { cache: "no-store" });
  const data = await response.json();
  return Response.json(data)
}
