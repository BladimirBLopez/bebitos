path = "src/components/ProductForm.tsx"
with open(path, "r") as f:
    content = f.read()

photos_block = '''        <SectionCard icon={Camera} title="Fotos">
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-brown/20 rounded-xl py-4 text-sm text-ink/50 cursor-pointer hover:border-brown/40 transition-colors">
            <Camera className="w-4 h-4" />
            {uploading ? "Subiendo..." : "Toca para subir una foto"}
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
          </label>
          <p className="text-[11px] text-ink/40 mt-2">
            📐 Para mejor apariencia sube fotos cuadradas (1:1) — evita fotos horizontales.
          </p>
          <div className="flex gap-2 flex-wrap mt-3">
            {form.images.map((img, i) => (
              <div key={i} className="relative">
                <img
                  src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_100,h_100,c_fill/${img}`}
                  alt=""
                  className="w-16 h-16 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 bg-red-400 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

'''

count_present = content.count(photos_block)
assert count_present == 1, f"Bloque de fotos encontrado {count_present} veces, se esperaba 1"

# Quitar de su posicion actual
content = content.replace(photos_block, "", 1)

# Insertar justo antes de "Características"
marker = '''        <SectionCard icon={Tag} title="Características">'''
count_marker = content.count(marker)
assert count_marker == 1, f"Marcador encontrado {count_marker} veces, se esperaba 1"
content = content.replace(marker, photos_block + marker, 1)

with open(path, "w") as f:
    f.write(content)
print("OK: seccion de Fotos movida antes de Caracteristicas")
