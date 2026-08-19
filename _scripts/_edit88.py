path = "src/app/admin/(panel)/configuracion/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        <SectionCard icon={DollarSign} title="Precios">
          <ToggleSwitch
            checked={form.showPrices}
            onChange={(v) => setForm((f) => f && { ...f, showPrices: v })}
            label="Mostrar precios en la tienda"
            description="Si lo apagas, los clientes tendran que consultar el precio por WhatsApp"
          />
        </SectionCard>

        <button
          type="submit"'''

new = '''        <SectionCard icon={DollarSign} title="Precios">
          <ToggleSwitch
            checked={form.showPrices}
            onChange={(v) => setForm((f) => f && { ...f, showPrices: v })}
            label="Mostrar precios en la tienda"
            description="Si lo apagas, los clientes tendran que consultar el precio por WhatsApp"
          />
        </SectionCard>

        <SectionCard icon={FileCheck} title="Informe de calidad">
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

        <button
          type="submit"'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''import { MessageCircle, MapPin, Truck, AtSign, Clock, Tag, Plus, X, DollarSign } from "lucide-react";'''
new2 = '''import { MessageCircle, MapPin, Truck, AtSign, Clock, Tag, Plus, X, DollarSign, FileCheck } from "lucide-react";'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: campo de informe de calidad agregado")
