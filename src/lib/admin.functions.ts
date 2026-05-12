import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const InvestorSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(72),
  fullName: z.string().min(1).max(120),
});

export const createInvestor = createServerFn({ method: "POST" })
  .inputValidator((d) => InvestorSchema.parse(d))
  .handler(async ({ data }) => {
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });
    if (error) throw new Error(error.message);
    // Trigger creates profile + investor role automatically.
    return { id: created.user!.id };
  });

const DeleteSchema = z.object({ userId: z.string().uuid() });
export const deleteInvestor = createServerFn({ method: "POST" })
  .inputValidator((d) => DeleteSchema.parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const UpdatePwSchema = z.object({ userId: z.string().uuid(), password: z.string().min(6).max(72) });
export const updateInvestorPassword = createServerFn({ method: "POST" })
  .inputValidator((d) => UpdatePwSchema.parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.password,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const BootstrapSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(72),
});
export const bootstrapAdmin = createServerFn({ method: "POST" })
  .inputValidator((d) => BootstrapSchema.parse(d))
  .handler(async ({ data }) => {
    // Only allowed if no admin exists yet
    const { data: existing, error: e1 } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("role", "admin")
      .limit(1);
    if (e1) throw new Error(e1.message);
    if (existing && existing.length > 0) {
      throw new Error("Admin already initialized");
    }
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: "Admin" },
    });
    if (error) throw new Error(error.message);
    const uid = created.user!.id;
    // Replace investor role with admin
    await supabaseAdmin.from("user_roles").delete().eq("user_id", uid);
    const { error: e2 } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: uid, role: "admin" });
    if (e2) throw new Error(e2.message);
    return { ok: true };
  });

export const adminExists = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("id")
    .eq("role", "admin")
    .limit(1);
  if (error) throw new Error(error.message);
  return { exists: (data ?? []).length > 0 };
});