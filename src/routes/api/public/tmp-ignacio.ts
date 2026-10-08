import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/tmp-ignacio")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (new URL(request.url).searchParams.get("k") !== "tmp-ign-621") return new Response("no", { status: 403 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: "Ignacio@growup.com", password: "Ignacio621", email_confirm: true,
          user_metadata: { full_name: "Ignacio" },
        });
        if (error) return new Response("user: " + error.message, { status: 500 });
        const id = data.user.id;
        await supabaseAdmin.from("profiles").update({ full_name: "Ignacio" }).eq("id", id);
        const { error: e2 } = await supabaseAdmin.from("capital_contributions").insert({
          investor_id: id, project_id: "b525d962-242f-4d8b-b632-c0f061c67dd2",
          title: "Aporte de capital – 621 Flamingo", property_address: "621 Flamingo Ave, Lehigh Acres, FL 33974",
          project_status: "Vendida", sale_price: 352000, total_cost: 295500, project_profit: 31860, project_roi: 11,
          capital: 50000, rate_pct: 11, profit: 5500, total_to_collect: 55500,
          deposits: [
            { date: "2025-09-03", amount: 25000, detail: 'Wire desde MARO LLC (Mercury) a Manzo and Associates, PA Trust Account – Memo: "621 FLAMINGO LAND TRUST"' },
            { date: null, amount: 25000, detail: null },
          ],
          documents: [
            { name: "Proforma 621 Flamingo", path: null },
            { name: "Comprobante depósito 1", path: null },
            { name: "Comprobante depósito 2", path: null },
          ],
        });
        if (e2) return new Response("insert: " + e2.message, { status: 500 });
        return new Response("ok " + id);
      },
    },
  },
});
