path = "src/components/Hero.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        <p className="text-cream/80 max-w-xl mx-auto text-base sm:text-lg">
          Articulos y accesorios pensados para el cuidado y la alimentacion de tu bebe, con la calidad que se merece.
        </p>
      </div>
    </section>
  );
}'''

new = '''        <p className="text-cream/80 max-w-xl mx-auto text-base sm:text-lg mb-7">
          Articulos y accesorios pensados para el cuidado y la alimentacion de tu bebe, con la calidad que se merece.
        </p>
        <a
          href="#catalogo"
          className="inline-block bg-green hover:bg-green-dark text-white font-semibold px-6 py-3 rounded-full transition-colors"
        >
          Ver productos
        </a>
      </div>
    </section>
  );
}'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: boton Ver productos agregado al hero")
