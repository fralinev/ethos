import { HttpError } from "@ethos/shared"

export async function apiFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const res = await fetch(url, {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new HttpError(res.status, text || `HTTP ${res.status}`);
    }

    return res.json();
  } catch (err: any) {
    if (err.name === "AbortError") throw err;
    throw err;
  }
}
