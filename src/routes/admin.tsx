import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { AppHeader } from "@/components/AppHeader";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ALL_STAGES, formatUSD } from "@/lib/stages";
import { Plus, Trash2, Edit, X } from "lucide-react";
import { toast } from "sonner";
import { adminExists, bootstrapAdmin, createInvestor, deleteInvestor, updateInvestorPassword } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const checkAdmin = useServerFn(adminExists);
  const [needsBootstrap, setNeedsBootstrap] = useState<boolean | null>(null);

  useEffect(() => {
    checkAdmin().then((r) => setNeedsBootstrap(!r.exists)).catch(() => setNeedsBootstrap(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    if (needsBootstrap === null) return;
    if (needsBootstrap) return;
    if (!user) navigate({ to: "/login" });
    else if (role && role !== "admin") navigate({ to: "/dashboard" });
  }, [user, role, loading, navigate, needsBootstrap]);

  if (needsBootstrap) return <BootstrapAdmin onDone={() => setNeedsBootstrap(false)} />;
  if (loading || !user || role !== "admin") {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Logo /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader name="Administrador" />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
        <Tabs defaultValue="investors" className="mt-6">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="projects">Proyectos</TabsTrigger>
            <TabsTrigger value="opps">Oportunidades</TabsTrigger>
          </TabsList>
          <TabsContent value="projects" className="mt-6"><ProjectsTab /></TabsContent>
          <TabsContent value="opps" className="mt-6"><OpportunitiesTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function BootstrapAdmin({ onDone }: { onDone: () => void }) {
  const boot = useServerFn(bootstrapAdmin);
  const [email, setEmail] = useState("admin@growup.com");
  const [password, setPassword] = useState("growup2024");
  const [submitting, setSubmitting] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="card-soft p-8 max-w-md w-full">
        <Logo />
        <h2 className="mt-6 text-2xl font-bold text-foreground">Inicializar Admin</h2>
        <p className="text-sm text-muted-foreground mt-1">Crea la primera cuenta de administrador.</p>
        <form className="mt-6 space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          setSubmitting(true);
          try {
            await boot({ data: { email, password } });
            toast.success("Admin creado. Ingresa con esas credenciales.");
            onDone();
          } catch (err: any) { toast.error(err.message); }
          finally { setSubmitting(false); }
        }}>
          <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><Label>Contraseña</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
          <Button className="w-full" disabled={submitting}>{submitting ? "Creando..." : "Crear admin"}</Button>
        </form>
      </div>
    </div>
  );
}

/* ---------------- INVESTORS ---------------- */
function InvestorsTab() {
  const [investors, setInvestors] = useState<any[]>([]);
  const create = useServerFn(createInvestor);
  const remove = useServerFn(deleteInvestor);
  const updatePw = useServerFn(updateInvestorPassword);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });

  const load = async () => {
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "investor");
    const ids = (roles ?? []).map((r) => r.user_id);
    if (ids.length === 0) return setInvestors([]);
    const { data } = await supabase.from("profiles").select("*").in("id", ids);
    setInvestors(data ?? []);
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Inversionistas</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Nuevo</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Crear inversionista</DialogTitle></DialogHeader>
            <form className="space-y-3" onSubmit={async (e) => {
              e.preventDefault();
              try {
                await create({ data: form });
                toast.success("Inversionista creado");
                setOpen(false); setForm({ fullName: "", email: "", password: "" }); load();
              } catch (err: any) { toast.error(err.message); }
            }}>
              <div><Label>Nombre</Label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
              <div><Label>Contraseña</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} /></div>
              <DialogFooter><Button type="submit">Crear</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="card-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground border-b border-border">
            <tr><th className="py-3 px-4">Nombre</th><th>Email</th><th></th></tr>
          </thead>
          <tbody>
            {investors.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">Sin inversionistas.</td></tr>}
            {investors.map((i) => (
              <tr key={i.id} className="border-b border-border/60">
                <td className="py-3 px-4 font-medium">{i.full_name}</td>
                <td>{i.email}</td>
                <td className="text-right pr-4">
                  <Button size="sm" variant="ghost" onClick={async () => {
                    const np = prompt("Nueva contraseña (mín 6):");
                    if (np && np.length >= 6) {
                      try { await updatePw({ data: { userId: i.id, password: np } }); toast.success("Contraseña actualizada"); }
                      catch (e: any) { toast.error(e.message); }
                    }
                  }}><Edit className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={async () => {
                    if (confirm(`Eliminar ${i.email}? Sus proyectos también se eliminarán.`)) {
                      try { await remove({ data: { userId: i.id } }); toast.success("Eliminado"); load(); }
                      catch (e: any) { toast.error(e.message); }
                    }
                  }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- PROJECTS ---------------- */
function ProjectsTab() {
  const [projects, setProjects] = useState<any[]>([]);
  const [investors, setInvestors] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => {
    const { data: p } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    setProjects(p ?? []);
    const { data: r } = await supabase.from("user_roles").select("user_id").eq("role", "investor");
    const ids = (r ?? []).map((x) => x.user_id);
    if (ids.length) {
      const { data: pr } = await supabase.from("profiles").select("*").in("id", ids);
      setInvestors(pr ?? []);
    }
  };
  useEffect(() => { load(); }, []);

  const newProject = async () => {
    if (investors.length === 0) return toast.error("Crea un inversionista primero.");
    const { data, error } = await supabase.from("projects").insert({
      investor_id: investors[0].id,
      address: "Nueva propiedad",
    }).select().single();
    if (error) return toast.error(error.message);
    // seed stages
    const rows = ALL_STAGES.map((s, idx) => ({
      project_id: data.id, stage_order: idx + 1, stage_name: s.name, stage_group: s.group,
      draw_number: idx + 1, draw_amount: 0,
    }));
    await supabase.from("project_stages").insert(rows);
    load();
    setEditing(data);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Proyectos</h2>
        <Button onClick={newProject}><Plus className="h-4 w-4" /> Nuevo</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {projects.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">Sin proyectos.</p>}
        {projects.map((p) => {
          const inv = investors.find((i) => i.id === p.investor_id);
          return (
            <div key={p.id} className="card-soft p-5">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{p.address}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{inv?.full_name ?? "—"} · {p.status}</p>
                  <p className="text-xs mt-2">{formatUSD(p.amount_deposited)} / {formatUSD(p.total_value)}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(p)}><Edit className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={async () => {
                    if (confirm("¿Eliminar proyecto?")) {
                      await supabase.from("projects").delete().eq("id", p.id);
                      load();
                    }
                  }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {editing && <ProjectEditor project={editing} investors={investors} onClose={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function ProjectEditor({ project, investors, onClose }: { project: any; investors: any[]; onClose: () => void }) {
  const [p, setP] = useState<any>(project);
  const [stages, setStages] = useState<any[]>([]);
  const [comps, setComps] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: s }, { data: c }, { data: i }] = await Promise.all([
        supabase.from("project_stages").select("*").eq("project_id", project.id).order("stage_order"),
        supabase.from("comparables").select("*").eq("project_id", project.id),
        supabase.from("portfolio_images").select("*").eq("project_id", project.id).order("sort_order"),
      ]);
      setStages(s ?? []); setComps(c ?? []); setImages(i ?? []);
    })();
  }, [project.id]);

  const save = async () => {
    const { id, created_at, updated_at, ...rest } = p;
    const { error } = await supabase.from("projects").update(rest).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Guardado");
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Editar proyecto</DialogTitle></DialogHeader>
        <div className="space-y-6">
          {/* Basic */}
          <section className="grid sm:grid-cols-2 gap-3">
            <div><Label>Inversionista</Label>
              <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={p.investor_id} onChange={(e) => setP({ ...p, investor_id: e.target.value })}>
                {investors.map((i) => <option key={i.id} value={i.id}>{i.full_name} ({i.email})</option>)}
              </select>
            </div>
            <div><Label>Estado</Label><Input value={p.status} onChange={(e) => setP({ ...p, status: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Dirección</Label><Input value={p.address} onChange={(e) => setP({ ...p, address: e.target.value })} /></div>
            <div><Label>Total del proyecto (USD)</Label><Input type="number" value={p.total_value ?? 0} onChange={(e) => setP({ ...p, total_value: Number(e.target.value) })} /></div>
            <div><Label>Depositado (USD)</Label><Input type="number" value={p.amount_deposited ?? 0} onChange={(e) => setP({ ...p, amount_deposited: Number(e.target.value) })} /></div>
            <div><Label>Precio venta estimado</Label><Input type="number" value={p.expected_sale_price ?? 0} onChange={(e) => setP({ ...p, expected_sale_price: Number(e.target.value) })} /></div>
            <div><Label>Costo total proyecto</Label><Input type="number" value={p.total_cost ?? 0} onChange={(e) => setP({ ...p, total_cost: Number(e.target.value) })} /></div>
          </section>

          {/* Specs */}
          <section>
            <h4 className="font-semibold mb-2">Especificaciones (Portafolio)</h4>
            <div className="grid sm:grid-cols-3 gap-3">
              <div><Label>Modelo</Label><Input value={p.model_name ?? ""} onChange={(e) => setP({ ...p, model_name: e.target.value })} /></div>
              <div><Label>Sqft total</Label><Input type="number" value={p.sqft_total ?? ""} onChange={(e) => setP({ ...p, sqft_total: Number(e.target.value) })} /></div>
              <div><Label>Sqft living</Label><Input type="number" value={p.sqft_living ?? ""} onChange={(e) => setP({ ...p, sqft_living: Number(e.target.value) })} /></div>
              <div><Label>Habitaciones</Label><Input type="number" value={p.bedrooms ?? ""} onChange={(e) => setP({ ...p, bedrooms: Number(e.target.value) })} /></div>
              <div><Label>Baños</Label><Input type="number" step="0.5" value={p.bathrooms ?? ""} onChange={(e) => setP({ ...p, bathrooms: Number(e.target.value) })} /></div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={!!p.garage} onCheckedChange={(v) => setP({ ...p, garage: v })} /><Label>Garage</Label></div>
              <div className="sm:col-span-3"><Label>Características adicionales</Label><Textarea value={p.features ?? ""} onChange={(e) => setP({ ...p, features: e.target.value })} /></div>
              <div className="sm:col-span-3"><Label>Notas / Detalles del proyecto</Label><Textarea rows={3} value={p.notes ?? ""} onChange={(e) => setP({ ...p, notes: e.target.value })} /></div>
            </div>
          </section>

          {/* Stages */}
          <section>
            <h4 className="font-semibold mb-2">Etapas / Draws</h4>
            <div className="space-y-1 max-h-72 overflow-y-auto border border-border rounded-md p-2">
              {stages.map((s) => (
                <div key={s.id} className="grid grid-cols-12 gap-2 items-center text-xs">
                  <span className="col-span-5 truncate" title={s.stage_name}>{s.stage_name}</span>
                  <Input className="col-span-2 h-8" type="number" value={s.draw_amount} onChange={(e) => setStages(stages.map((x) => x.id === s.id ? { ...x, draw_amount: Number(e.target.value) } : x))} />
                  <label className="col-span-2 flex items-center gap-1"><input type="checkbox" checked={s.completed} onChange={(e) => setStages(stages.map((x) => x.id === s.id ? { ...x, completed: e.target.checked } : x))} /> OK</label>
                  <label className="col-span-2 flex items-center gap-1"><input type="checkbox" checked={s.active} onChange={(e) => setStages(stages.map((x) => x.id === s.id ? { ...x, active: e.target.checked, completed: e.target.checked ? false : x.completed } : { ...x, active: false }))} /> Actual</label>
                  <Button size="sm" variant="ghost" className="col-span-1 h-8 px-2" onClick={async () => {
                    await supabase.from("project_stages").update({ draw_amount: s.draw_amount, completed: s.completed, active: s.active }).eq("id", s.id);
                    toast.success("Etapa guardada");
                  }}>💾</Button>
                </div>
              ))}
            </div>
            <Button size="sm" variant="outline" className="mt-2" onClick={async () => {
              for (const s of stages) {
                await supabase.from("project_stages").update({ draw_amount: s.draw_amount, completed: s.completed, active: s.active }).eq("id", s.id);
              }
              toast.success("Todas las etapas guardadas");
            }}>Guardar todas las etapas</Button>
          </section>

          {/* Comparables */}
          <section>
            <h4 className="font-semibold mb-2 flex items-center justify-between">Comparables
              <Button size="sm" variant="outline" onClick={async () => {
                const { data } = await supabase.from("comparables").insert({ project_id: project.id, address: "Nueva", sale_price: 0 }).select().single();
                if (data) setComps([...comps, data]);
              }}><Plus className="h-3 w-3" /></Button>
            </h4>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {comps.map((c) => (
                <div key={c.id} className="grid grid-cols-12 gap-2 text-xs items-center">
                  <Input className="col-span-4 h-8" placeholder="Dirección" value={c.address} onChange={(e) => setComps(comps.map((x) => x.id === c.id ? { ...x, address: e.target.value } : x))} />
                  <Input className="col-span-2 h-8" type="number" placeholder="$" value={c.sale_price} onChange={(e) => setComps(comps.map((x) => x.id === c.id ? { ...x, sale_price: Number(e.target.value) } : x))} />
                  <Input className="col-span-1 h-8" type="number" placeholder="sqft" value={c.sqft_total ?? ""} onChange={(e) => setComps(comps.map((x) => x.id === c.id ? { ...x, sqft_total: Number(e.target.value) } : x))} />
                  <Input className="col-span-1 h-8" type="number" placeholder="liv" value={c.sqft_living ?? ""} onChange={(e) => setComps(comps.map((x) => x.id === c.id ? { ...x, sqft_living: Number(e.target.value) } : x))} />
                  <Input className="col-span-1 h-8" type="number" placeholder="DOM" value={c.days_on_market ?? ""} onChange={(e) => setComps(comps.map((x) => x.id === c.id ? { ...x, days_on_market: Number(e.target.value) } : x))} />
                  <Input className="col-span-2 h-8" type="date" value={c.sale_date ?? ""} onChange={(e) => setComps(comps.map((x) => x.id === c.id ? { ...x, sale_date: e.target.value } : x))} />
                  <Button size="sm" variant="ghost" className="col-span-1" onClick={async () => {
                    await supabase.from("comparables").update({ address: c.address, sale_price: c.sale_price, sqft_total: c.sqft_total, sqft_living: c.sqft_living, days_on_market: c.days_on_market, sale_date: c.sale_date || null }).eq("id", c.id);
                    toast.success("Guardado");
                  }}>💾</Button>
                </div>
              ))}
            </div>
          </section>

          {/* Images */}
          <section>
            <h4 className="font-semibold mb-2 flex items-center justify-between">Fotos del Portafolio
              <Button size="sm" variant="outline" onClick={async () => {
                const url = prompt("URL de la imagen:");
                if (url) {
                  const { data } = await supabase.from("portfolio_images").insert({ project_id: project.id, image_url: url }).select().single();
                  if (data) setImages([...images, data]);
                }
              }}><Plus className="h-3 w-3" /></Button>
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {images.map((img) => (
                <div key={img.id} className="relative group">
                  <img src={img.image_url} className="w-full h-24 object-cover rounded" />
                  <button className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100" onClick={async () => {
                    await supabase.from("portfolio_images").delete().eq("id", img.id);
                    setImages(images.filter((x) => x.id !== img.id));
                  }}><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          </section>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cerrar</Button><Button onClick={save}>Guardar proyecto</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- OPPORTUNITIES ---------------- */
function OpportunitiesTab() {
  const [opps, setOpps] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => {
    const { data } = await supabase.from("opportunities").select("*").order("created_at", { ascending: false });
    setOpps(data ?? []);
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Oportunidades</h2>
        <Button onClick={async () => {
          const { data } = await supabase.from("opportunities").insert({ name: "Nueva oportunidad", location: "Florida, FL", expected_roi: 0, total_investment: 0 }).select().single();
          if (data) { load(); setEditing(data); }
        }}><Plus className="h-4 w-4" /> Nueva</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {opps.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">Sin oportunidades.</p>}
        {opps.map((o) => (
          <div key={o.id} className="card-soft p-5 flex justify-between">
            <div>
              <h3 className="font-semibold">{o.name}</h3>
              <p className="text-xs text-muted-foreground">{o.location} · ROI {o.expected_roi}% · {formatUSD(o.total_investment)}</p>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => setEditing(o)}><Edit className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" onClick={async () => { if (confirm("¿Eliminar?")) { await supabase.from("opportunities").delete().eq("id", o.id); load(); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <Dialog open onOpenChange={(open) => !open && (setEditing(null), load())}>
          <DialogContent>
            <DialogHeader><DialogTitle>Editar oportunidad</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nombre / Dirección</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><Label>Ubicación</Label><Input value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>ROI esperado %</Label><Input type="number" value={editing.expected_roi} onChange={(e) => setEditing({ ...editing, expected_roi: Number(e.target.value) })} /></div>
                <div><Label>Inversión total</Label><Input type="number" value={editing.total_investment} onChange={(e) => setEditing({ ...editing, total_investment: Number(e.target.value) })} /></div>
              </div>
              <div><Label>Estado</Label><Input value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} /></div>
              <div><Label>URL contacto (WhatsApp)</Label><Input value={editing.contact_url ?? ""} onChange={(e) => setEditing({ ...editing, contact_url: e.target.value })} /></div>
              <div><Label>URL imagen</Label><Input value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button onClick={async () => {
                const { id, created_at, ...rest } = editing;
                await supabase.from("opportunities").update(rest).eq("id", id);
                toast.success("Guardado");
                setEditing(null); load();
              }}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}