import { NextResponse, type NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";
import { withAuth, type NextRequestWithAuth } from "next-auth/middleware";

type Role = "ADMIN" | "USER";

interface RoleConfig {
  dashboard: string;
  allowedPaths: string[];
  apiPrefixes: string[];
  authRoutes?: string[];
  signoutRedirect?: string;
}

type AppToken = JWT & {
  role?: Role;
};

const ROLE_CONFIG: Record<Role, RoleConfig> = {
  ADMIN: {
    dashboard: "/admin/dashboard",
    allowedPaths: ["/admin"],
    apiPrefixes: ["/api/admin", "/api/revalidate"],
  },
  USER: {
    dashboard: "/user/dashboard",
    allowedPaths: ["/candidate"],
    apiPrefixes: [
      "/api/candidates",
    ],
    authRoutes: ["/auth/signin"],
    signoutRedirect: "/auth/signin",
  },
};

const PUBLIC_ROUTES: string[] = [
  "/auth/signin",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/",
  "/api/public",
  "/api/auth",
];

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const token = req?.nextauth?.token as AppToken | null;

    /* 1. Handle signout redirects */
    if (pathname === "/auth/signout" || pathname === "/api/auth/signout") {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    /* 2. Public routes */
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    /* 3. Interview links */
    if (pathname.startsWith("/candidate/interview")) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }

      if (token.role !== "USER") {
        const redirectUrl =
          ROLE_CONFIG[token.role as Role]?.dashboard ?? "/auth/signin";
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      }

      return NextResponse.next();
    }

    /* 4. API routes */
    if (pathname.startsWith("/api")) {
      return handleApiRoute(req, token);
    }

    /* 5. Unauthenticated users */
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    /* 6. Role-based access */
    const userRole = token.role as Role | undefined;
    const roleConfig = userRole ? ROLE_CONFIG[userRole] : undefined;

    if (!roleConfig) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    const isAllowedRoute = roleConfig.allowedPaths.some((path) =>
      pathname.startsWith(path)
    );

    if (!isAllowedRoute) {
      return NextResponse.redirect(
        new URL(roleConfig.dashboard, req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;

        if (isPublicRoute(pathname)) {
          return true;
        }

        return !!token;
      },
    },
    pages: {
      signIn: "/auth/signin",
      error: "/auth/signin",
    },
  }
);

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route)
  );
}

function handleApiRoute(
  req: NextRequest,
  token: AppToken | null
): NextResponse {
  const { pathname } = req.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    return unauthorizedResponse();
  }

  const userRole = token.role as Role | undefined;
  const roleConfig = userRole ? ROLE_CONFIG[userRole] : undefined;

  if (!roleConfig) {
    return forbiddenResponse();
  }

  const isAllowedApiRoute = roleConfig.apiPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isAllowedApiRoute) {
    return forbiddenResponse();
  }

  return NextResponse.next();
}

function unauthorizedResponse(): NextResponse {
  return new NextResponse(
    JSON.stringify({ success: false, message: "Unauthorized" }),
    {
      status: 401,
      headers: { "Content-Type": "application/json" },
    }
  );
}

function forbiddenResponse(): NextResponse {
  return new NextResponse(
    JSON.stringify({ success: false, message: "Forbidden" }),
    {
      status: 403,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|videos|processor\\.js).*)",
  ],
};
