"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [verifyInfo, setVerifyInfo] = useState<any>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setDebugInfo(null);
    setLoading(true);

    const res = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      setError((data && data.error) || "Usuario o contraseña incorrectos");
      if (data && data.debugCatch) setDebugInfo({ debugCatch: data.debugCatch });
      return;
    }

    if (data && data.debug) {
      setDebugInfo(data.debug);
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
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

      {debugInfo && (
        <div className="w-full max-w-xs mt-4">
          <pre className="text-xs bg-black text-lime-400 p-3 rounded overflow-auto whitespace-pre-wrap">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
          <button
            onClick={async () => {
              const r = await fetch("/api/admin/users", { credentials: "include", cache: "no-store" });
              const d = await r.json().catch(() => null);
              setVerifyInfo({ status: r.status, body: d });
            }}
            className="w-full mt-2 bg-brown-dark hover:bg-ink text-cream font-semibold py-2 rounded-full"
          >
            Verificar cookie ahora (sin navegar)
          </button>
          {verifyInfo && (
            <pre className="text-xs bg-black text-yellow-300 p-3 rounded overflow-auto whitespace-pre-wrap mt-2">
              {JSON.stringify(verifyInfo, null, 2)}
            </pre>
          )}
          <button
            onClick={() => {
              router.push("/admin/productos");
              router.refresh();
            }}
            className="w-full mt-2 bg-green hover:bg-green-dark text-white font-semibold py-2 rounded-full"
          >
            Continuar a Productos
          </button>
        </div>
      )}
    </div>
  );
}
