// // apps/web/middleware.ts
// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";

// // Public paths that should *never* redirect
// const PUBLIC_PATHS = new Set([
//   "/login",
//   "/health",
//   "/healthz",
//   "/readyz",
//   "/api/health", // if you expose one
// ]);

// export function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   // Allow Next.js internals and static assets
//   if (
//     pathname.startsWith("/_next") ||
//     pathname.startsWith("/favicon.ico") ||
//     pathname.startsWith("/robots.txt") ||
//     pathname.startsWith("/sitemap.xml") ||
//     /\.[a-zA-Z0-9]+$/.test(pathname) // e.g., .png, .jpg, .css, .js, etc.
//   ) {
//     return NextResponse.next();
//   }

//   // Allow listed public routes
//   if (PUBLIC_PATHS.has(pathname)) {
//     return NextResponse.next();
//   }

//   // For now, treat *everyone* as unauthenticated
//   const url = req.nextUrl.clone();
//   url.pathname = "/login";
//   url.search = "";
// console.log("URL", url)

//   return NextResponse.redirect(url);
// }

// // Apply to everything except static files handled above
// export const config = {
//   matcher: ["/:path*"],
// };