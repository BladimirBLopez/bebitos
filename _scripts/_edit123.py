path = "src/app/admin/(panel)/configuracion/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        <SectionCard icon={MessageCircle} title="WhatsApp">
          <label className="text-xs font-medium text-ink/60 block mb-1">
            Número (con código de país, sin espacios ni +)
          </label>
          <input
            value={form.whatsapp}
            onChange={(e) => setForm((f) => f && { ...f, whatsapp: e.target.value })}
            className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
            placeholder="59169501208"
          />
        </SectionCard>

        <SectionCard icon={MapPin} title="Ubicación">'''

new = '''        <SectionCard icon={MapPin} title="Ubicación">'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: tarjeta de WhatsApp duplicada eliminada")
