"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, password }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Usuario o contraseña incorrectos");
      return;
    }

    router.push("/admin/productos");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-brown-dark flex flex-col items-center justify-center px-6">
      <Image
        src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787019365/Dise%C3%B1o_sin_t%C3%ADtulo_7_qau8wd.png"
        alt="Bebitos"
        width={72}
        height={72}
        className="rounded-full mb-4"
      />
      <h1 className="font-display text-2xl font-semibold text-cream mb-6">
        Panel de administración
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs bg-cream rounded-2xl p-6 flex flex-col gap-3"
      >
        <input
          type="text"
          placeholder="Usuario"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="border border-brown/20 rounded-lg px-3 py-2 text-ink outline-none focus:border-brown"
          autoCapitalize="off"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-brown/20 rounded-lg px-3 py-2 text-ink outline-none focus:border-brown"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-green hover:bg-green-dark text-white font-semibold py-2.5 rounded-full transition-colors disabled:opacity-60"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
