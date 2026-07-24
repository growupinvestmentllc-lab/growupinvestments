import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import * as React from "react";
import { render } from "@react-email/render";
import { z } from "zod";
import { TEMPLATES } from "@/lib/email-templates/registry";

const SITE_NAME = "growupinvestments";
const SENDER_DOMAIN = "notify.growupinvestments.com";
const FROM_DOMAIN = "notify.growupinvestments.com";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().nullable(),
  message: z.string().trim().max(1000).optional().nullable(),
  opportunity_id: z.string().uuid().optional().nullable(),
  opportunity_name: z.string().trim().max(200).optional().nullable(),
});

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const Route = createFileRoute("/api/public/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }
        const parsed = bodySchema.safeParse(raw);
        if (!parsed.success) {
          return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
        }
        const data = parsed.data;

        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        // Persist the contact request
        const { error: insertErr } = await supabase.from("contact_requests").insert({
          name: data.name,
          email: data.email,
          phone: data.phone ?? null,
          message: data.message ?? null,
          opportunity_id: data.opportunity_id ?? null,
          opportunity_name: data.opportunity_name ?? null,
        });
        if (insertErr) {
          console.error("contact_requests insert failed", insertErr);
          return Response.json({ error: "Failed to save request" }, { status: 500 });
        }

        // Render and enqueue notification email to the site owner
        const template = TEMPLATES["contact-notification"];
        if (!template) {
          return Response.json({ success: true, emailed: false });
        }
        const templateData = {
          name: data.name,
          email: data.email,
          phone: data.phone ?? "",
          message: data.message ?? "",
          opportunityName: data.opportunity_name ?? "",
        };
        const recipient = template.to!;
        const messageId = crypto.randomUUID();

        try {
          const element = React.createElement(template.component, templateData);
          const html = await render(element);
          const text = await render(element, { plainText: true });
          const subject =
            typeof template.subject === "function" ? template.subject(templateData) : template.subject;

          // Ensure an unsubscribe token exists (required by queue payload)
          const normalized = recipient.toLowerCase();
          let unsubscribeToken: string;
          const { data: existing } = await supabase
            .from("email_unsubscribe_tokens")
            .select("token")
            .eq("email", normalized)
            .maybeSingle();
          if (existing?.token) {
            unsubscribeToken = existing.token;
          } else {
            unsubscribeToken = generateToken();
            await supabase
              .from("email_unsubscribe_tokens")
              .upsert(
                { token: unsubscribeToken, email: normalized },
                { onConflict: "email", ignoreDuplicates: true },
              );
            const { data: stored } = await supabase
              .from("email_unsubscribe_tokens")
              .select("token")
              .eq("email", normalized)
              .maybeSingle();
            if (stored?.token) unsubscribeToken = stored.token;
          }

          await supabase.from("email_send_log").insert({
            message_id: messageId,
            template_name: "contact-notification",
            recipient_email: recipient,
            status: "pending",
          });

          const { error: enqErr } = await supabase.rpc("enqueue_email", {
            queue_name: "transactional_emails",
            payload: {
              message_id: messageId,
              to: recipient,
              from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
              sender_domain: SENDER_DOMAIN,
              subject,
              html,
              text,
              purpose: "transactional",
              label: "contact-notification",
              idempotency_key: messageId,
              unsubscribe_token: unsubscribeToken,
              queued_at: new Date().toISOString(),
            },
          });
          if (enqErr) {
            console.error("enqueue_email failed", enqErr);
            await supabase.from("email_send_log").insert({
              message_id: messageId,
              template_name: "contact-notification",
              recipient_email: recipient,
              status: "failed",
              error_message: "Failed to enqueue",
            });
          }
        } catch (err) {
          console.error("Email render/enqueue error", err);
        }

        return Response.json({ success: true });
      },
    },
  },
});