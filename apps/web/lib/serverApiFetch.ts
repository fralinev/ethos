import { cookies } from "next/headers";

export async function serverApiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T, status: number }> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString()
  const res = await fetch(
    `${process.env.API_BASE_URL}${path}`,
    {
      ...options,
      headers: {
        ...(options.headers || {}),
        Cookie: cookieHeader,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );
  const data = await res.json();
  return { data, status: res.status };
}
