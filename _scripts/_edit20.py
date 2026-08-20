path = "src/components/ShareButton.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''export default function ShareButton({
  title,
  text,
}: {
  title: string;
  text?: string;
}) {'''
assert content.count(old) == 1, "old no matchea"
new = '''export default function ShareButton({
  title,
  text,
  iconOnly,
}: {
  title: string;
  text?: string;
  iconOnly?: boolean;
}) {'''
content = content.replace(old, new)

old2 = '''  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-sm text-brown-dark/70 hover:text-brown-dark border border-brown/15 hover:border-brown/30 rounded-full px-3.5 py-2 transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          ¡Copiado!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Compartir
        </>
      )}
    </button>
  );
}'''
assert content.count(old2) == 1, "old2 no matchea"
new2 = '''  if (iconOnly) {
    return (
      <button
        onClick={handleShare}
        aria-label="Compartir"
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-cream hover:bg-white/30 transition-colors"
      >
        {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-sm text-brown-dark/70 hover:text-brown-dark border border-brown/15 hover:border-brown/30 rounded-full px-3.5 py-2 transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          ¡Copiado!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Compartir
        </>
      )}
    </button>
  );
}'''
content = content.replace(old2, new2)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - variante iconOnly agregada")
