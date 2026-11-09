"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Q, br } from "@/lib/util";

export default function ClientesAtendidos() {
  const [rows,setRows] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);
  const [erro,setErro] = useState("");
  const [mes,setMes] = useState("todos");

  useEffect(() => {
    let ativo = true;
    supabase().from("appointments").select(Q).not("atendido_em","is",null).order("data",{ascending:false}).order("horario",{ascending:false}).then(({data,error}) => {
      if (!ativo) return;
      if (error) { setErro("Não foi possível carregar os atendimentos: "+error.message); setRows([]); }
      else { setErro(""); setRows(data||[]); }
      setLoading(false);
    });
    return () => { ativo = false; };
  }, []);

  const meses = useMemo(() => Array.from(new Set(rows.map(a=>String(a.data||"").slice(0,7)))).filter(Boolean),[rows]);
  const filtrados = mes==="todos" ? rows : rows.filter(a=>String(a.data||"").startsWith(mes));
  const grupos = useMemo(() => filtrados.reduce((acc:any[],a:any) => {
    const key=String(a.data||"").slice(0,7)||"sem-data";
    let g=acc.find(x=>x.key===key);
    if(!g){g={key,items:[]};acc.push(g);}
    g.items.push(a);return acc;
  },[]),[filtrados]);
  const nomeMes=(key:string)=>{if(key==="sem-data")return "Data não informada";const [ano,m]=key.split("-").map(Number);return new Date(ano,m-1,1,12).toLocaleDateString("pt-BR",{month:"long",year:"numeric"});};

  return <div className="space-y-5">
    <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#F28C28]">Histórico de serviços</p><h1 className="text-2xl font-extrabold text-[#123B60]">Clientes atendidos</h1><p className="text-sm text-slate-500">Atendimentos marcados como concluídos, organizados pelo mês do agendamento.</p></div>
    <div className="flex flex-wrap items-center gap-3"><label className="text-sm font-semibold text-slate-700" htmlFor="mes-atendidos">Consultar mês</label><select id="mes-atendidos" value={mes} onChange={e=>setMes(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="todos">Todos os meses</option>{meses.map(m=><option key={m} value={m}>{nomeMes(m)}</option>)}</select><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">{filtrados.length} atendido(s)</span></div>
    {erro&&<p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{erro}</p>}
    {loading&&<p className="text-sm text-slate-500">Carregando histórico...</p>}
    {!loading&&!erro&&!filtrados.length&&<div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500">Nenhum cliente marcado como atendido neste período.</div>}
    {grupos.map(g=><section key={g.key} className="space-y-3"><div className="flex items-center justify-between border-b border-slate-200 pb-2"><h2 className="text-lg font-bold capitalize text-[#123B60]">{nomeMes(g.key)}</h2><span className="text-xs font-semibold text-emerald-700">{g.items.length} atendimento(s)</span></div><div className="grid gap-3 sm:grid-cols-2">{g.items.map((a:any)=><article key={a.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-bold text-[#123B60]">{a.cliente}</h3><p className="mt-1 text-sm text-slate-600">{a.telefone||"Telefone não informado"}</p></div><span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">Atendido</span></div><p className="mt-3 text-sm text-slate-700">{a.data?br(a.data):"Data não informada"} · {String(a.horario||"").slice(0,5)}</p><p className="mt-1 text-xs text-slate-500">{a.services?.nome||"Serviço"} · {a.professionals?.nome||"Profissional"}</p></article>)}</div></section>)}
  </div>;
}
