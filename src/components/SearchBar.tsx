"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  function doSearch() {
    if (value.trim()) {
      router.push(`/?q=${encodeURIComponent(value.trim())}`);
      setOpen(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSearch();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-brown-dark p-1.5" aria-label="Buscar">
        <Search className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-cream border-b border-brown/15 shadow-md px-4 py-3 z-40">
          <form onSubmit={handleSubmit} className="max-w-6xl mx-auto flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ink/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                autoFocus
                type="search"
                enterKeyHint="search"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    doSearch();
                  }
                }}
                placeholder="Buscar producto..."
                className="w-full bg-white border border-brown/15 rounded-full pl-9 pr-3 py-2.5 text-sm outline-none focus:border-brown/40"
              />
            </div>
            <button
              type="button"
              onClick={doSearch}
              className="bg-brown-dark hover:bg-ink text-cream text-sm font-medium px-4 py-2.5 rounded-full transition-colors shrink-0"
            >
              Buscar
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-brown-dark/60 p-1.5 shrink-0">
              <X className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
