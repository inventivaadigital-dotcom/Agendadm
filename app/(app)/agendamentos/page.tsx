"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Q, br, hh, end, useAtivos, inp, btn2 } from "@/lib/util";
import Link from "next/link";
export default function Lista() {
  const profs = useAtivos("professionals"), servs = useAtivos("services");
  const [f, setF] = useState({ q: "", p: "", d: "", s: "" }); const [rows, setRows] = useState<any[]>([]); const [n, setN] = useState(0);
  useEffect(() => { const p = new URLSearchParams(location.search).get("prof"); if (p) setF((x) => ({ ...x, p })); }, []);
  useEffect(() => {
    let q = supabase().from("appointments").select(Q).order("data", { ascending: false }).order("horario");
    if (f.q) q = q.ilike("cliente", `%${f.q}%`); if (f.p) q = q.eq("professional_id", f.p); if (f.d) q = q.eq("data", f.d); if (f.s) q = q.eq("service_id", f.s);
    q.then((r) => setRows(r.data || []));
  }, [f, n]);
  async function del(a: any) { if (confirm(`Excluir o agendamento de ${a.cliente} em ${br(a.data)}? Esta ação não pode ser desfeita.`)) { await supabase().from("appointments").delete().eq("id", a.id); setN(n + 1); } }
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Agendamentos</h1>
      <div className="grid gap-2 md:grid-cols-4">
        <input className={inp} placeholder="Buscar cliente" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
        <select className={inp} value={f.p} onChange={(e) => setF({ ...f, p: e.target.value })}><option value="">Todos os profissionais</option>{profs.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}</select>
        <input type="date" className={inp} value={f.d} onChange={(e) => setF({ ...f, d: e.target.value })} />
        <select className={inp} value={f.s} onChange={(e) => setF({ ...f, s: e.target.value })}><option value="">Todos os serviços</option>{servs.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}</select>
      </div>
      {rows.map((a) => (
        <div key={a.id} className="rounded-2xl border p-3">
          <b>{a.cliente}</b> <span className="text-azul">{br(a.data)} {hh(a.horario)}</span>
          <p className="text-sm text-gray-600">{a.services?.nome} · {a.professionals?.nome}</p><p className="text-sm">{end(a)}</p>
          <div className="mt-2 flex gap-2"><Link className={btn2} href={`/agendamentos/${a.id}`}>Editar</Link><Link className={btn2} href={`/comprovante/${a.id}`}>Comprovante</Link><button className={btn2} onClick={() => del(a)}>Excluir</button></div>
        </div>))}
      {!rows.length && <p className="text-gray-500">Nenhum agendamento encontrado.</p>}
    </div>
  );
}
