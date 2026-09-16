import { auth } from "@/lib/auth";

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "ADMIN";

  // Public paths — redirect logged-in users away from auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (isLoggedIn) {
      return Response.redirect(
        new URL(isAdmin ? "/admin" : "/dashboard", req.nextUrl.origin)
      );
    }
  }

  // User-protected routes
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/jual-hp")
  ) {
    if (!isLoggedIn) {
      return Response.redirect(
        new URL("/login", req.nextUrl.origin)
      );
    }
  }

  // Admin-protected routes (skip /admin/login itself)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!isLoggedIn) {
      return Response.redirect(
        new URL("/admin/login", req.nextUrl.origin)
      );
    }
    if (!isAdmin) {
      return Response.redirect(new URL("/", req.nextUrl.origin));
    }
  }
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
