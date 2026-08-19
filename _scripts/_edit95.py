path = "src/app/admin/(panel)/configuracion/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        <SectionCard icon={FileCheck} title="Informe de calidad">
          <label className="text-xs font-medium text-ink/60 block mb-1">
            Link del informe (subelo a Cloudinary y pega el link aqui)
          </label>
          <input
            value={form.qualityReportUrl}
            onChange={(e) => setForm((f) => f && { ...f, qualityReportUrl: e.target.value })}
            className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
            placeholder="https://..."
          />
        </SectionCard>

'''

new = ''''''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: campo de informe de calidad quitado del panel")
