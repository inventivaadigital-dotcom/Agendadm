"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {supabase} from "@/lib/supabase/client";
import {Q,br,hh,end,inp,btn2,hoje} from "@/lib/util";

export default function ContratosAtendidos(){
 const [mes,setMes]=useState(hoje().slice(0,7));
 const [rows,setRows]=useState<any[]>([]);
 const [loading,setLoading]=useState(true);
 const [erro,setErro]=useState("");
 useEffect(()=>{
  let ativo=true;
  setLoading(true);setErro("");
  const [ano,mm]=mes.split("-").map(Number);
  const inicio=mes+"-01";
  const fim=mes+"-"+String(new Date(ano,mm,0).getDate()).padStart(2,"0");
  supabase().from("appointments").select("*, services!inner(nome), professionals(nome, telefone, cargo)").gte("data",inicio).lte("data",fim).ilike("services.nome","manutenção mensal").order("data",{ascending:false}).order("horario")
   .then(({data,error})=>{if(!ativo)return;if(error){setErro("Não foi possível carregar os contratos atendidos: "+error.message);setRows([])}else setRows(data||[]);setLoading(false)});
  return()=>{ativo=false};
 },[mes]);

 const agoraSP=new Intl.DateTimeFormat("sv-SE",{timeZone:"America/Sao_Paulo",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(new Date()).replace(" ","T");
 const atendidos=rows.filter(a=>`${a.data}T${hh(a.horario)}`<agoraSP.slice(0,16)).length;
 const agendados=rows.length-atendidos;
 const mudarMes=(delta:number)=>{
  const d=new Date(mes+"-01T12:00:00");d.setMonth(d.getMonth()+delta);
  setMes(d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0"));
 };
 const nomeMes=new Date(mes+"-01T12:00:00").toLocaleDateString("pt-BR",{month:"long",year:"numeric"});

 return <div className="space-y-4">
  <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#F28C28]">Histórico mensal</p><h1 className="text-2xl font-extrabold text-[#123B60]">Contratos atendidos</h1><p className="text-sm text-slate-500">Acompanhamento das manutenções mensais por mês</p></div>
   <label className="flex items-center gap-2 text-sm font-semibold text-[#123B60]">Mês <input aria-label="Selecionar mês" type="month" className={inp+" w-auto min-w-0"} value={mes} onChange={e=>setMes(e.target.value)}/></label>
  </div>
  <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-2">
   <button type="button" onClick={()=>mudarMes(-1)} className={btn2}>← Mês anterior</button>
   <p className="text-center font-bold capitalize text-[#123B60]">{nomeMes}</p>
   <button type="button" onClick={()=>mudarMes(1)} className={btn2}>Próximo mês →</button>
  </div>
  <div className="grid gap-2 sm:grid-cols-2">
   <div className="rounded-2xl bg-green-50 p-3 text-sm text-green-800"><b className="text-xl">{atendidos}</b><p>Atendido(s)</p></div>
   <div className="rounded-2xl bg-orange-50 p-3 text-sm text-orange-800"><b className="text-xl">{agendados}</b><p>Agendado(s)</p></div>
  </div>
  {loading&&<p className="text-sm text-slate-500">Carregando contratos...</p>}
  {erro&&<p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{erro}</p>}
  {!loading&&!erro&&!rows.length&&<div className="rounded-2xl border border-dashed p-6 text-center text-slate-500">Nenhuma manutenção mensal encontrada neste mês.</div>}
  {rows.map(a=>{
   const foiAtendido=`${a.data}T${hh(a.horario)}`<agoraSP.slice(0,16);
   return <article key={a.id} className="space-y-2 rounded-2xl border border-slate-200 p-4">
    <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-bold text-[#123B60]">{a.cliente}</h2><p className="text-sm font-semibold text-[#1765A5]">{br(a.data)} às {hh(a.horario)}</p></div><span className={foiAtendido?"rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800":"rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800"}>{foiAtendido?"Atendido":"Agendado"}</span></div>
    <p className="text-sm text-slate-700"><b>Serviço:</b> {a.services?.nome||"—"}</p><p className="text-sm text-slate-700"><b>Telefone:</b> {a.telefone||"Não informado"}</p><p className="text-sm text-slate-700"><b>Endereço:</b> {end(a)}</p>
    <p className="text-sm text-slate-700"><b>Profissional:</b> {a.professionals?.nome||"Não informado"}{a.professionals?.telefone?" · "+a.professionals.telefone:""}</p>{a.complemento&&<p className="text-sm text-slate-700"><b>Complemento:</b> {a.complemento}</p>}
    <div className="flex flex-wrap gap-2 pt-1"><Link className={btn2} href={`/agendamentos/${a.id}`}>Abrir agendamento</Link><Link className={btn2} href={`/comprovante/${a.id}`}>Comprovante</Link></div>
   </article>;
  })}
 </div>;
}