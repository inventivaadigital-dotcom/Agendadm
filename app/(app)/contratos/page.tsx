"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {supabase} from "@/lib/supabase/client";
import {Q,br,hh,end,inp,btn2,hoje} from "@/lib/util";
export default function ContratosAtendidos(){
 const [mes,setMes]=useState(hoje().slice(0,7)); const [rows,setRows]=useState<any[]>([]); const [loading,setLoading]=useState(true); const [erro,setErro]=useState("");
 useEffect(()=>{let ativo=true;setLoading(true);setErro("");const [ano,mm]=mes.split("-").map(Number);const inicio=mes+"-01";const fim=mes+"-"+String(new Date(ano,mm,0).getDate()).padStart(2,"0");
 supabase().from("appointments").select(Q).gte("data",inicio).lte("data",fim).ilike("services.nome","manutenção mensal").order("data",{ascending:false}).order("horario")
 .then(({data,error})=>{if(!ativo)return;if(error){setErro("Não foi possível carregar os contratos atendidos: "+error.message);setRows([])}else setRows(data||[]);setLoading(false)});
 return()=>{ativo=false};},[mes]);
 return <div className="space-y-4">
 <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#F28C28]">Histórico mensal</p><h1 className="text-2xl font-extrabold text-[#123B60]">Contratos atendidos</h1><p className="text-sm text-slate-500">Agendamentos com o serviço “manutenção mensal”</p></div>
 <label className="flex items-center gap-2 text-sm font-semibold text-[#123B60]">Mês <input aria-label="Selecionar mês" type="month" className={inp+" w-auto min-w-0"} value={mes} onChange={e=>setMes(e.target.value)}/></label></div>
 <div className="rounded-2xl bg-blue-50 p-3 text-sm text-[#123B60]"><b>{rows.length}</b> atendimento(s) encontrado(s) neste mês.</div>
 {loading&&<p className="text-sm text-slate-500">Carregando contratos...</p>}{erro&&<p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{erro}</p>}
 {!loading&&!erro&&!rows.length&&<div className="rounded-2xl border border-dashed p-6 text-center text-slate-500">Nenhum contrato com manutenção mensal atendido neste mês.</div>}
 {rows.map(a=><article key={a.id} className="space-y-2 rounded-2xl border border-slate-200 p-4">
 <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-bold text-[#123B60]">{a.cliente}</h2><p className="text-sm font-semibold text-[#1765A5]">{br(a.data)} às {hh(a.horario)}</p></div><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">Manutenção mensal</span></div>
 <p className="text-sm text-slate-700"><b>Serviço:</b> {a.services?.nome||"—"}</p><p className="text-sm text-slate-700"><b>Telefone:</b> {a.telefone||"Não informado"}</p><p className="text-sm text-slate-700"><b>Endereço:</b> {end(a)}</p>
 <p className="text-sm text-slate-700"><b>Profissional:</b> {a.professionals?.nome||"Não informado"}{a.professionals?.telefone?" · "+a.professionals.telefone:""}</p>{a.complemento&&<p className="text-sm text-slate-700"><b>Complemento:</b> {a.complemento}</p>}
 <div className="flex flex-wrap gap-2 pt-1"><Link className={btn2} href={`/agendamentos/${a.id}`}>Abrir agendamento</Link><Link className={btn2} href={`/comprovante/${a.id}`}>Comprovante</Link></div></article>)}
 </div>;
}
