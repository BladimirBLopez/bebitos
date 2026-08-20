path = "src/app/links/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Agregar WhatsAppIcon justo después de ChatIcon
old1 = '''function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.55L4 20l1.05-4.4A8.5 8.5 0 1 1 21 11.5Z" />
    </svg>
  );
}'''
assert content.count(old1) == 1, "old1 no matchea"
new1 = old1 + '''

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.34a9.9 9.9 0 0 0 4.62 1.17h.01c5.46 0 9.9-4.45 9.9-9.92C21.95 6.45 17.5 2 12.04 2Zm5.83 14.03c-.24.68-1.4 1.3-1.93 1.34-.49.05-.98.24-3.28-.68-2.77-1.11-4.55-3.94-4.69-4.13-.14-.19-1.13-1.5-1.13-2.86s.7-2.03.95-2.31c.24-.27.53-.34.71-.34l.51.01c.16 0 .38-.06.6.46l.83 2.01c.07.16.12.35.02.55-.1.2-.15.32-.29.5-.14.17-.3.38-.43.51-.14.14-.29.29-.13.57.16.29.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.29.14.46.12.63-.07.17-.19.72-.83.91-1.12.19-.29.38-.24.63-.14.26.1 1.65.78 1.93.92.29.14.48.21.55.33.07.12.07.68-.17 1.36Z" />
    </svg>
  );
}'''
content = content.replace(old1, new1)

# 2. Logo Bebitos: agrandar del 70% al 92%
old2 = '            className="object-contain w-[70%] h-auto"'
assert content.count(old2) == 1, "old2 no matchea"
new2 = '            className="object-contain w-[92%] h-auto"'
content = content.replace(old2, new2)

# 3. Botón WhatsApp: usar WhatsAppIcon en vez de ChatIcon
old3 = '              <ChatIcon />'
assert content.count(old3) == 1, "old3 no matchea"
new3 = '              <WhatsAppIcon />'
content = content.replace(old3, new3)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - 3 reemplazos aplicados")
