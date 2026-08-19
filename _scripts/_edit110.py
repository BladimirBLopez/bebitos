path = "src/app/admin/(panel)/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''            <div key={s.label} className="bg-white rounded-2xl p-5">'''
new = '''            <div key={s.label} className="bg-white rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''      <div className="bg-white rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">'''
new2 = '''      <div className="bg-white rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3" style={{ boxShadow: "var(--shadow-card)" }}>'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: dashboard con sombras suaves")
