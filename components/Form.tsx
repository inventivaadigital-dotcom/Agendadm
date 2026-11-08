"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { hoje, useAtivos, inp, btn, btn2 } from "@/lib/util";
const vazio = { cliente: "", service_id: "", data: hoje(), horario: "", professional_id: "", rua: "", numero: "", bairro: "", cidade: "", complemento: "", telefone: "" };
const obrig = ["cliente", "data", "horario", "professional_id", "rua", "numero", "bairro", "cidade"];
export default function Form({ id }: { id?: string }) {
  const r = useRouter(); const [f, setF] = useState<any>(vazio); const [erro, setErro] = useState(""); const [servicoTexto, setServicoTexto] = useState(""); const [rascunhoCarregado, setRascunhoCarregado] = useState(false); const chaveRascunho = `marcondes-agendamento-rascunho-${id || "novo"}`;
  const servs = useAtivos("services"), profs = useAtivos("professionals");
  useEffect(() => { let ativo = true; (async () => { let base:any = {...vazio}; if(id){ const x=await supabase().from("appointments").select("*").eq("id",id).single(); if(x.data) base={...vazio,...x.data,horario:x.data.horario.slice(0,5),complemento:x.data.complemento||"",telefone:x.data.telefone||""}; } let salvo:any=null; try { const raw=localStorage.getItem(chaveRascunho); if(raw) salvo=JSON.parse(raw); } catch {} if(!ativo)return; if(salvo?.f){base={...base,...salvo.f};setServicoTexto(salvo.servicoTexto||"");} else {const prof=new URLSearchParams(location.search).get("prof");if(prof&&!id)base.professional_id=prof;} setF(base);setRascunhoCarregado(true); })(); return()=>{ativo=false}; },[id]);
  useEffect(() => { if(!rascunhoCarregado)return; try { localStorage.setItem(chaveRascunho,JSON.stringify({f,servicoTexto,atualizadoEm:new Date().toISOString()})); } catch {} },[f,servicoTexto,rascunhoCarregado,chaveRascunho]);
  useEffect(() => { if(f.service_id && servs.length) { const found=servs.find((x:any)=>x.id===f.service_id); if(found)setServicoTexto(found.nome); } },[f.service_id,servs]);
  const escolherServico = (valor:string) => { setServicoTexto(valor); };
  const s = (k: string) => (e: any) => setF((old:any) => ({ ...old, [k]: e.target.value }));
  async function salvar(e: React.FormEvent) {
    e.preventDefault(); setErro("");
    if (obrig.some((k) => !String(f[k]).trim()) || !servicoTexto.trim()) return setErro("Preencha todos os campos obrigatórios. Só o telefone é opcional.");
    if (isNaN(new Date(f.data).getTime())) return setErro("Data inválida.");
    const nomeServico = servicoTexto.trim();
    let servico = servs.find((x:any) => x.nome.trim().toLocaleLowerCase("pt-BR") === nomeServico.toLocaleLowerCase("pt-BR"));
    if (!servico) {
      const criado = await supabase().from("services").insert({ nome: nomeServico, ativo: true }).select("id,nome").single();
      if (criado.error && criado.error.code !== "23505") return setErro("Não foi possível registrar o serviço: " + criado.error.message);
      if (criado.data) servico = criado.data;
      else {
        const existente = await supabase().from("services").select("id,nome").ilike("nome", nomeServico).limit(1).maybeSingle();
        if (existente.error || !existente.data) return setErro("Não foi possível localizar ou registrar esse serviço. Tente novamente.");
        servico = existente.data;
      }
    }
    const row = { cliente: f.cliente.trim(), service_id: servico.id, professional_id: f.professional_id, data: f.data, horario: f.horario, rua: f.rua, numero: f.numero, bairro: f.bairro, cidade: f.cidade, complemento: f.complemento || null, telefone: f.telefone || null };
    const q = id ? supabase().from("appointments").update(row).eq("id", id).select("id").single() : supabase().from("appointments").insert(row).select("id").single();
    const { data, error } = await q;
    if (error) return setErro(error.code === "23505" ? (error.message.includes("telefone") ? "Este telefone já está cadastrado para outro cliente. Confira o número informado." : "Conflito: este profissional já tem um atendimento nesta data e horário.") : "Erro ao salvar: " + error.message);
    try { localStorage.removeItem(chaveRascunho); } catch {}
    r.push(`/comprovante/${data!.id}`);
  }
  const L = (t: string, c: any) => <label className="block text-sm">{t}{c}</label>;
  return (
    <form onSubmit={salvar} className="grid gap-3 md:grid-cols-2">
      <h1 className="text-2xl font-bold md:col-span-2">{id ? "Editar agendamento" : "Novo agendamento"}</h1>
      {L("Nome completo do cliente *", <input className={inp} value={f.cliente} onChange={s("cliente")} />)}
      {L("Serviço *", <input className={inp} value={servicoTexto} onChange={(e)=>escolherServico(e.target.value)} placeholder="Digite o serviço..." autoComplete="off" />)}
      {L("Data *", <input type="date" className={inp} value={f.data} onChange={s("data")} />)}
      {L("Horário *", <input type="time" className={inp} value={f.horario} onChange={s("horario")} />)}
      {L("Profissional responsável *", <select className={inp} value={f.professional_id} onChange={s("professional_id")}><option value="">Selecione</option>{profs.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}</select>)}
      {L("Telefone (opcional)", <input type="tel" className={inp} value={f.telefone} onChange={s("telefone")} />)}
      {L("Rua *", <input className={inp} value={f.rua} onChange={s("rua")} />)}
      {L("Número *", <input className={inp} value={f.numero} onChange={s("numero")} />)}
      {L("Bairro *", <input className={inp} value={f.bairro} onChange={s("bairro")} />)}
      {L("Cidade *", <input className={inp} value={f.cidade} onChange={s("cidade")} />)}
      {L("Complemento", <input className={inp} value={f.complemento} onChange={s("complemento")} />)}
      {erro && <p className="font-medium text-red-600 md:col-span-2">{erro}</p>}
      <div className="flex gap-2 md:col-span-2"><button className={btn}>Salvar agendamento</button><button type="button" className={btn2} onClick={() => r.back()}>Cancelar</button></div>
    </form>
  );
}
