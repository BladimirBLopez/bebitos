with open("src/middleware.ts", "r") as f:
    content = f.read()

content = content.replace(
    "export async function middleware(req: NextRequest) {",
    "export async function proxy(req: NextRequest) {"
)

with open("src/proxy.ts", "w") as f:
    f.write(content)

print("OK: proxy.ts creado")
