import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const searchSchema = z.object({
  opportunity_id: z.string().optional(),
  opportunity_name: z.string().optional(),
});

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Contacto — GrowUp Investments" },
      { name: "description", content: "Hablemos de tu próxima inversión. Respondemos en menos de 24 horas hábiles." },
      { property: "og:title", content: "Contacto — GrowUp Investments" },
      { property: "og:description", content: "Hablemos de tu próxima inversión." },
    ],
  }),
});

const formSchema = z.object({
  name: z.string().trim().min(1, "Ingresá tu nombre").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().max(1000).optional(),
});

function ContactPage() {
  const { user } = useAuth();
  const { opportunity_id, opportunity_name } = useSearch({ from: "/contact" });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    opportunity_name ? `Quiero más información sobre ${opportunity_name}.` : "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = formSchema.safeParse({ name, email, phone, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    if (!user) {
      toast.error("Iniciá sesión para enviar el formulario.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contact_requests").insert({
      user_id: user.id,
      opportunity_id: opportunity_id ?? null,
      opportunity_name: opportunity_name ?? null,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Mensaje enviado. Te contactamos pronto.");
  }

  return (
    <div className="min-h-screen bg-[#D5DAD0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-[#3E4A3C] hover:text-[#2F3A2D]">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-3xl bg-[#D5DAD0] p-6 sm:p-10 lg:p-14 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#3E4A3C] uppercase">Contacto</p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-[#1A1F18] leading-tight">
              Hablemos de tu<br />próxima inversión.
            </h1>
            <p className="mt-4 text-[#3E4A3C]">Respondemos en menos de 24 horas hábiles.</p>
            {opportunity_name && (
              <p className="mt-3 text-sm text-[#2F4F3F] font-medium">Consulta sobre: {opportunity_name}</p>
            )}
          </div>

          <div className="rounded-2xl bg-[#F9FAF7] p-6 sm:p-8 shadow-sm">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <h2 className="text-2xl font-bold text-[#1A1F18]">¡Gracias!</h2>
                <p className="mt-2 text-[#3E4A3C] max-w-sm">
                  Recibimos tu mensaje. Un asesor de GrowUp Investments te contactará a la brevedad.
                </p>
                <Button asChild className="mt-6 bg-[#2F4F3F] hover:bg-[#263F32] text-white">
                  <Link to="/dashboard">Volver al portal</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="name" className="text-[#1A1F18]">Nombre</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} className="bg-[#F9FAF7] border-[#C5CFC1] focus:border-[#2F4F3F] focus:ring-[#2F4F3F]" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-[#1A1F18]">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} className="bg-[#F9FAF7] border-[#C5CFC1] focus:border-[#2F4F3F] focus:ring-[#2F4F3F]" />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-[#1A1F18]">Teléfono</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} className="bg-[#F9FAF7] border-[#C5CFC1] focus:border-[#2F4F3F] focus:ring-[#2F4F3F]" />
                </div>
                <div>
                  <Label htmlFor="message" className="text-[#1A1F18]">Mensaje</Label>
                  <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} maxLength={1000} className="bg-[#F9FAF7] border-[#C5CFC1] focus:border-[#2F4F3F] focus:ring-[#2F4F3F]" />
                </div>
                <Button type="submit" className="w-full bg-[#2F4F3F] hover:bg-[#263F32] text-white" size="lg" disabled={submitting}>
                  {submitting ? "Enviando..." : "Enviar"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}