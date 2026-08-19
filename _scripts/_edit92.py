path = "src/components/Footer.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''            <li>
              <Link href="/links" className="text-cream/60 hover:text-cream text-sm transition-colors">
                Nuestros enlaces
              </Link>
            </li>
          </ul>
        </div>'''

new = '''            <li>
              <Link href="/links" className="text-cream/60 hover:text-cream text-sm transition-colors">
                Nuestros enlaces
              </Link>
            </li>
            <li>
              <Link href="/calidad" className="text-cream/60 hover:text-cream text-sm transition-colors">
                Calidad y seguridad
              </Link>
            </li>
          </ul>
        </div>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: link calidad en footer")
