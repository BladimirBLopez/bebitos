path = "src/middleware.ts"
with open(path, "r") as f:
    content = f.read()

old = '''export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const cookie = req.cookies.get(COOKIE_NAME)?.value;
    const valid = await isValidSession(cookie);
    if (!valid) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};'''

new = '''export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const isApiAdmin = pathname.startsWith("/api/admin");
  const isPanelAdmin = pathname.startsWith("/admin");

  if (isApiAdmin || isPanelAdmin) {
    const cookie = req.cookies.get(COOKIE_NAME)?.value;
    const valid = await isValidSession(cookie);
    if (!valid) {
      if (isApiAdmin) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: middleware protege tambien /api/admin/*")
