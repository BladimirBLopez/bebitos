path = "src/app/admin/(panel)/configuracion/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''  return (
    <SectionCard icon={AtSign} title="Redes sociales">
      <div className="grid grid-cols-3 gap-3">'''

new = '''  return (
    <SectionCard icon={MessageCircle} title="Contacto y redes">
      <label className="text-xs font-medium text-ink/60 block mb-1">
        WhatsApp (con código de país, sin espacios ni +)
      </label>
      <input
        value={form.whatsapp}
        onChange={(e) => setForm((f) => f && { ...f, whatsapp: e.target.value })}
        className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40 mb-4"
        placeholder="59169501208"
      />
      <p className="text-xs font-medium text-ink/60 mb-2">Redes sociales</p>
      <div className="grid grid-cols-3 gap-3">'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: paso 1 completado - WhatsApp movido dentro de SocialGrid")
