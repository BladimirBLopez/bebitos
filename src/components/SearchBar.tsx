"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) {
      router.push(`/?q=${encodeURIComponent(value.trim())}`);
      setOpen(false);
    }
  }

  if (open) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5 flex-1 sm:flex-none">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Buscar producto..."
          className="flex-1 sm:w-48 bg-white border border-brown/15 rounded-full px-3.5 py-1.5 text-sm outline-none focus:border-brown/40"
        />
        <button type="button" onClick={() => setOpen(false)} className="text-brown-dark/60 p-1">
          <X className="w-4 h-4" />
        </button>
      </form>
    );
  }

  return (
    <button onClick={() => setOpen(true)} className="text-brown-dark p-1.5" aria-label="Buscar">
      <Search className="w-5 h-5" />
    </button>
  );
}
