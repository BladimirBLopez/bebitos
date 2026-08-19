path = "src/components/ProductForm.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const url = form.id
      ? `/api/admin/products/${form.id}`
      : "/api/admin/products";
    const method = form.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });'''

new = '''  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const url = form.id
      ? `/api/admin/products/${form.id}`
      : "/api/admin/products";
    const method = form.id ? "PUT" : "POST";

    const payload = showPrices ? form : { ...form, price: form.price || "1" };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: precio simbolico enviado cuando el campo esta oculto")
