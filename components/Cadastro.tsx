"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { inp, btn, btn2 } from "@/lib/util";
export default function Cadastro({ t, titulo, desc }: { t: "professionals" | "services"; titulo: string; desc?: boolean }) {
 const [rows,setRows]=useState<any[]>([]);const[nome,setNome]=useState("");const[telefone,setTelefone]=useState("");const[cargo,setCargo]=useState("");const[d,setD]=useState("");const[msg,setMsg]=useState("");
 const load=()=>supabase().from(t).select("*").order("nome").then(x=>setRows(x.data||[]));
 useEffect(()=>{load()},[]);
 async function add(){if(nome.trim().length<2)return setMsg("Informe o nome.");if(t==="professionals"&&!telefone.trim())return setMsg("Informe o telefone do profissional.");const nomeLimpo=nome.trim().replace(/\\s+/g," ");const payload:any=t==="professionals"?{nome:nomeLimpo,telefone:telefone.trim()||null,cargo:cargo.trim()||null}:{nome:nomeLimpo,...(desc?{descricao:d||null}:{})};const{error}=await supabase().from(t).insert(payload);setMsg(error?(error.code==="23505"?"Já existe um profissional com esse nome.": "Não foi possível cadastrar: "+error.message):"Cadastro realizado.");if(!error){setNome("");setTelefone("");setCargo("");setD("");}load();}
 async function up(id:string,v:any){const valor={...v,...(typeof v.nome==="string"?{nome:v.nome.trim().replace(/\\s+/g," ")}:{})};const{error}=await supabase().from(t).update(valor).eq("id",id);setMsg(error?(error.code==="23505"?"Já existe um profissional com esse nome.":"Não foi possível atualizar: "+error.message):"Cadastro atualizado.");load();}
 async function del(id:string){if(!confirm("Excluir este cadastro?"))return;const{error}=await supabase().from(t).delete().eq("id",id);setMsg(error?"Possui histórico de agendamentos e não pode ser excluído. Desative-o.":"");load();}
 return <div className="space-y-4"><h1 className="text-2xl font-bold">{titulo}</h1>
 <div className="grid gap-2 rounded-2xl bg-slate-50 p-3 sm:grid-cols-2">
 <input className={inp} placeholder="Nome completo" value={nome} onChange={e=>setNome(e.target.value)}/>
 {t==="professionals"&&<><input className={inp} placeholder="Telefone" inputMode="tel" required value={telefone} onChange={e=>setTelefone(e.target.value)}/><input className={inp} placeholder="Função / cargo" value={cargo} onChange={e=>setCargo(e.target.value)}/></>}
 {desc&&<input className={inp} placeholder="Descrição (opcional)" value={d} onChange={e=>setD(e.target.value)}/>}
 <button className={btn} onClick={add}>+ Adicionar</button></div>
 {msg&&<p className="text-sm text-slate-600">{msg}</p>}
 <div className="grid gap-3 sm:grid-cols-2">{rows.map(r=><div key={r.id} className="rounded-2xl border border-slate-200 p-4 shadow-sm">
 <b className={r.ativo?"text-[#123B60]":"text-gray-400 line-through"}>{r.nome}</b>{r.telefone&&<p className="mt-1 text-sm text-slate-500">{r.telefone}</p>}{r.cargo&&<p className="text-sm font-medium text-slate-600">{r.cargo}</p>}{r.descricao&&<p className="text-sm text-gray-500">{r.descricao}</p>}
 <div className="mt-3 flex flex-wrap gap-2"><button className={btn2} onClick={()=>{const n=prompt("Novo nome:",r.nome);if(n?.trim())up(r.id,{nome:n.trim()});if(t==="professionals"){const tel=prompt("Telefone:",r.telefone||"");const cg=prompt("Função / cargo:",r.cargo||"");up(r.id,{...(tel!==null?{telefone:tel.trim()}:{}),...(cg!==null?{cargo:cg.trim()||null}:{})});}}}>Editar</button><button className={btn2} onClick={()=>up(r.id,{ativo:!r.ativo})}>{r.ativo?"Desativar":"Ativar"}</button>{t==="professionals"&&<Link className={btn2} href={`/agendamentos?prof=${r.id}`}>Agendamentos</Link>}<button className={btn2} onClick={()=>del(r.id)}>Excluir</button></div>
 </div>)}</div></div>;
}
