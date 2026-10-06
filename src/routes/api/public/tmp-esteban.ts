import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/tmp-esteban")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: list } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
        let user = list?.users.find((u) => u.email?.toLowerCase() === "esteban@growup.com");
        if (!user) {
          const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: "Esteban@growup.com",
            password: "GrowUp-Esteban26",
            email_confirm: true,
            user_metadata: { full_name: "Esteban Martellotto" },
          });
          if (error) return new Response(error.message, { status: 500 });
          user = data.user!;
        }
        const { data: existing } = await supabaseAdmin.from("loans").select("id").eq("investor_id", user.id);
        if (!existing?.length) {
          const { error } = await supabaseAdmin.from("loans").insert({
            investor_id: user.id,
            lender: "Esteban Martellotto",
            borrower: "GROWUP INVESTMENTS LLC",
            borrower_signer: "Lucas Martin Morra, Member-Manager",
            principal: 30000,
            rate_pct: 9,
            issue_date: "2025-12-26",
            lender_signed_date: "2025-12-28",
            maturity_date: "2026-12-26",
            interest_at_maturity: 2700,
            total_at_maturity: 32700,
            status: "Activo",
            collateral_address: "621 Flamingo Ave, Lehigh Acres, FL 33974",
            collateral_description:
              "Garantía temporal – interés de GROWUP INVESTMENTS LLC como beneficiario en el land trust de 621 Flamingo Ave, con FLTR LLC como trustee.",
            collateral_project_id: "b525d962-242f-4d8b-b632-c0f061c67dd2",
            document_path: "loans/promissory-note-621-flamingo.pdf",
            document_name: "Promissory Note - 621 Flamingo Ave.pdf",
            docusign_envelope_id: "E4D2C735-ABFE-43D6-B6F6-10DBA56D920D",
          } as never);
          if (error) return new Response(error.message, { status: 500 });
        }
        return Response.json({ id: user.id });
      },
    },
  },
});
