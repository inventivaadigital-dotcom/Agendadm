"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { hoje, Q, useAtivos, inp, btn2 } from "@/lib/util";
import Card from "@/components/Card";
const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
export default function Agenda() {
  const h = hoje(); const profs = useAtivos("professionals");
  const [ano, setAno] = useState(+h.slice(0, 4)); const [mes, setMes] = useState(+h.slice(5, 7) - 1);
  const [p, setP] = useState(""); const [sel, setSel] = useState(h); const [rows, setRows] = useState<any[]>([]);
  const pad = (n: number) => String(n).padStart(2, "0");
  useEffect(() => {
    const ini = `${ano}-${pad(mes + 1)}-01`, fim = `${ano}-${pad(mes + 1)}-${pad(new Date(ano, mes + 1, 0).getDate())}`;
    let q = supabase().from("appointments").select(Q).gte("data", ini).lte("data", fim).order("horario");
    if (p) q = q.eq("professional_id", p); q.then((r) => setRows(r.data || []));
  }, [ano, mes, p]);
  const mover = (d: number) => { const x = new Date(ano, mes + d, 1); setAno(x.getFullYear()); setMes(x.getMonth()); };
  const vazios = new Date(ano, mes, 1).getDay(), total = new Date(ano, mes + 1, 0).getDate();
  const cont = (d: string) => rows.filter((a) => a.data === d).length;
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Agenda mensal</h1>
      <div className="flex flex-wrap gap-2">
        <button className={btn2} onClick={() => mover(-1)}>‹ Anterior</button>
        <select className={inp + " !w-auto"} value={mes} onChange={(e) => setMes(+e.target.value)}>{meses.map((m, i) => <option key={m} value={i}>{m}</option>)}</select>
        <input type="number" className={inp + " !w-24"} value={ano} onChange={(e) => setAno(+e.target.value)} />
        <button className={btn2} onClick={() => mover(1)}>Próximo ›</button>
        <select className={inp + " !w-auto"} value={p} onChange={(e) => setP(e.target.value)}><option value="">Todos os profissionais</option>{profs.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}</select>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map((d) => <b key={d}>{d}</b>)}
        {Array.from({ length: vazios }).map((_, i) => <span key={"v" + i} />)}
        {Array.from({ length: total }, (_, i) => { const d = `${ano}-${pad(mes + 1)}-${pad(i + 1)}`, c = cont(d); return (
          <button key={d} onClick={() => setSel(d)} className={`rounded-lg p-2 ${sel === d ? "bg-azul text-white" : "bg-gelo"}`}>{i + 1}{c > 0 && <span className="block rounded-full bg-laranja text-xs text-white">{c}</span>}</button>); })}
      </div>
      <h2 className="font-semibold">{sel.split("-").reverse().join("/")}</h2>
      {rows.filter((a) => a.data === sel).map((a) => <Card key={a.id} a={a} />)}
      {!cont(sel) && <p className="text-gray-500">Sem atendimentos neste dia.</p>}
    </div>
  );
}
