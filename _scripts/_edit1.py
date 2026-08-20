path = "src/app/links/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Logo: más chico, círculo blanco, nueva imagen sin fondo
old1 = '''        <div className="w-44 h-44 sm:w-48 sm:h-48 rounded-full border-[6px] border-cream shadow-2xl overflow-hidden relative bg-white flex items-center justify-center">
            <Image
              src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787086146/Dise%C3%B1o_sin_t%C3%ADtulo_8_ccrkbc.png"
              alt="Bebitos"
              width={140}
              height={44}
              className="object-contain w-[62%] h-auto"
              priority
            />
          </div>'''
assert content.count(old1) == 1
new1 = '''        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[4px] border-white shadow-2xl overflow-hidden relative bg-white flex items-center justify-center">
            <Image
              src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787203042/Dise%C3%B1o_sin_t%C3%ADtulo_10_yatmgd.png"
              alt="Bebitos"
              width={140}
              height={140}
              className="object-contain w-[70%] h-auto"
              priority
            />
          </div>'''
content = content.replace(old1, new1)

# 2. Botón WhatsApp: de verde a brown-dark
old2 = '''              className="flex items-center gap-3 bg-green hover:bg-green-dark text-white rounded-2xl px-4 py-3.5 shadow-md transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                <ChatIcon />
              </span>
              <div className="text-left">
                <p className="font-display font-medium text-sm">Comprar por WhatsApp</p>
                <p className="text-xs text-white/70">Pedidos y consultas</p>
              </div>'''
assert content.count(old2) == 1
new2 = '''              className="flex items-center gap-3 bg-brown-dark hover:bg-ink text-cream rounded-2xl px-4 py-3.5 shadow-md transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-cream/15 flex items-center justify-center shrink-0">
                <ChatIcon />
              </span>
              <div className="text-left">
                <p className="font-display font-medium text-sm">Comprar por WhatsApp</p>
                <p className="text-xs text-cream/70">Pedidos y consultas</p>
              </div>'''
content = content.replace(old2, new2)

# 3. Botón Visítanos: de blanco a brown-dark
old3 = '''              className="flex items-center gap-3 bg-white hover:bg-white/80 text-brown-dark rounded-2xl px-4 py-3.5 border border-brown/15 shadow-sm transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-brown-dark/10 flex items-center justify-center shrink-0">
                <PinIcon />
              </span>
              <div className="text-left">
                <p className="font-medium text-sm">Visítanos</p>
                <p className="text-xs text-ink/50">Nuestro punto físico en Santa Cruz</p>
              </div>'''
assert content.count(old3) == 1
new3 = '''              className="flex items-center gap-3 bg-brown-dark hover:bg-ink text-cream rounded-2xl px-4 py-3.5 shadow-md transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-cream/15 flex items-center justify-center shrink-0">
                <PinIcon />
              </span>
              <div className="text-left">
                <p className="font-display font-medium text-sm">Visítanos</p>
                <p className="text-xs text-cream/70">Nuestro punto físico en Santa Cruz</p>
              </div>'''
content = content.replace(old3, new3)

# 4. Botones de redes (lista inferior): de blanco a brown-dark
old4 = '''              className="flex items-center gap-3 bg-white hover:bg-white/80 text-brown-dark rounded-2xl px-4 py-3.5 border border-brown/15 shadow-sm transition-colors"
              >
                <span className="w-10 h-10 rounded-full bg-brown-dark/10 flex items-center justify-center shrink-0">
                  {ICONS[s.name]}
                </span>
                <div className="text-left">
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-ink/50">{s.desc}</p>
                </div>'''
assert content.count(old4) == 1
new4 = '''              className="flex items-center gap-3 bg-brown-dark hover:bg-ink text-cream rounded-2xl px-4 py-3.5 shadow-md transition-colors"
              >
                <span className="w-10 h-10 rounded-full bg-cream/15 flex items-center justify-center shrink-0">
                  {ICONS[s.name]}
                </span>
                <div className="text-left">
                  <p className="font-display font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-cream/70">{s.desc}</p>
                </div>'''
content = content.replace(old4, new4)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - 4 reemplazos aplicados")
