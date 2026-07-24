import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/unsubscribe")({
  component: UnsubscribePage,
  validateSearch: (s: Record<string, unknown>) => ({ token: (s.token as string) ?? "" }),
  head: () => ({ meta: [{ title: "Cancelar suscripción — GrowUp Investments" }] }),
});

function UnsubscribePage() {
  const { token } = Route.useSearch();
  const [state, setState] = useState<"loading" | "valid" | "already" | "invalid" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const b = await r.json().catch(() => ({}));
        if (!r.ok) return setState("invalid");
        if (b.valid) setState("valid");
        else if (b.reason === "already_unsubscribed") setState("already");
        else setState("invalid");
      })
      .catch(() => setState("invalid"));
  }, [token]);

  async function confirm() {
    try {
      const r = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const b = await r.json().catch(() => ({}));
      if (r.ok && b.success) setState("success");
      else if (b?.reason === "already_unsubscribed") setState("already");
      else setState("error");
    } catch { setState("error"); }
  }

  return (
    <div className="min-h-screen bg-[#D5DAD0] flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl bg-[#F9FAF7] p-8 shadow-sm text-center">
        <h1 className="text-2xl font-bold text-[#1A1F18]">GrowUp Investments</h1>
        {state === "loading" && <p className="mt-4 text-[#3E4A3C]">Verificando…</p>}
        {state === "valid" && (
          <>
            <p className="mt-4 text-[#3E4A3C]">¿Confirmás que querés dejar de recibir emails?</p>
            <button onClick={confirm} className="mt-6 w-full rounded-md bg-[#2F4F3F] hover:bg-[#263F32] text-white py-2.5 font-medium">
              Confirmar
            </button>
          </>
        )}
        {state === "success" && <p className="mt-4 text-[#3E4A3C]">Listo. No recibirás más emails.</p>}
        {state === "already" && <p className="mt-4 text-[#3E4A3C]">Ya te habías dado de baja anteriormente.</p>}
        {state === "invalid" && <p className="mt-4 text-[#3E4A3C]">Enlace inválido o expirado.</p>}
        {state === "error" && <p className="mt-4 text-red-700">Ocurrió un error. Intentá más tarde.</p>}
      </div>
    </div>
  );
}