path = "src/app/links/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Botón WhatsApp: verde -> brown-dark
old1 = '''            className="flex items-center gap-3 bg-green hover:bg-green-dark text-white rounded-2xl px-4 py-3.5 shadow-md transition-colors"
          >
            <span className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <ChatIcon />
            </span>
            <div className="text-left">
              <p className="font-display font-medium text-sm">Comprar por WhatsApp</p>
              <p className="text-xs text-white/70">Pedidos y consultas</p>
            </div>'''
assert content.count(old1) == 1, "old1 no matchea"
new1 = '''            className="flex items-center gap-3 bg-brown-dark hover:bg-ink text-cream rounded-2xl px-4 py-3.5 shadow-md transition-colors"
          >
            <span className="w-10 h-10 rounded-full bg-cream/15 flex items-center justify-center shrink-0">
              <ChatIcon />
            </span>
            <div className="text-left">
              <p className="font-display font-medium text-sm">Comprar por WhatsApp</p>
              <p className="text-xs text-cream/70">Pedidos y consultas</p>
            </div>'''
content = content.replace(old1, new1)

# 2. Botón Visítanos: blanco -> brown-dark
old2 = '''            className="flex items-center gap-3 bg-white hover:bg-white/80 text-brown-dark rounded-2xl px-4 py-3.5 border border-brown/15 shadow-sm transition-colors"
          >
            <span className="w-10 h-10 rounded-full bg-brown-dark/10 flex items-center justify-center shrink-0">
              <PinIcon />
            </span>
            <div className="text-left">
              <p className="font-medium text-sm">Vis\u00edtanos</p>
              <p className="text-xs text-ink/50">Nuestro punto f\u00edsico en Santa Cruz</p>
            </div>'''
assert content.count(old2) == 1, "old2 no matchea"
new2 = '''            className="flex items-center gap-3 bg-brown-dark hover:bg-ink text-cream rounded-2xl px-4 py-3.5 shadow-md transition-colors"
          >
            <span className="w-10 h-10 rounded-full bg-cream/15 flex items-center justify-center shrink-0">
              <PinIcon />
            </span>
            <div className="text-left">
              <p className="font-display font-medium text-sm">Vis\u00edtanos</p>
              <p className="text-xs text-cream/70">Nuestro punto f\u00edsico en Santa Cruz</p>
            </div>'''
content = content.replace(old2, new2)

# 3. Botones de redes (map): blanco -> brown-dark
old3 = '''              className="flex items-center gap-3 bg-white hover:bg-white/80 text-brown-dark rounded-2xl px-4 py-3.5 border border-brown/15 shadow-sm transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-brown-dark/10 flex items-center justify-center shrink-0">
                {ICONS[s.name]}
              </span>
              <div className="text-left">
                <p className="font-medium text-sm">{s.name}</p>
                <p className="text-xs text-ink/50">{s.desc}</p>
              </div>'''
assert content.count(old3) == 1, "old3 no matchea"
new3 = '''              className="flex items-center gap-3 bg-brown-dark hover:bg-ink text-cream rounded-2xl px-4 py-3.5 shadow-md transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-cream/15 flex items-center justify-center shrink-0">
                {ICONS[s.name]}
              </span>
              <div className="text-left">
                <p className="font-display font-medium text-sm">{s.name}</p>
                <p className="text-xs text-cream/70">{s.desc}</p>
              </div>'''
content = content.replace(old3, new3)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - 3 reemplazos aplicados")
