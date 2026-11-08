"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Q, br, hh, end } from "@/lib/util";

export default function AppointmentDetails({ id }: { id: string }) {
  const [a, setA] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  useEffect(() => {
    let ativo = true;
    supabase().from("appointments").select(Q).eq("id", id).single().then(({data,error}) => {
      if (!ativo) return;
      if (error) setErro("Não foi possível carregar os dados deste agendamento: " + error.message);
      else setA(data);
      setLoading(false);
    });
    return () => { ativo = false; };
  }, [id]);
  const campo = (nome: string, valor: any) => <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{nome}</p><p className="mt-1 break-words font-medium text-slate-800">{valor || "Não informado"}</p></div>;
  if (loading) return <p className="rounded-xl bg-slate-50 p-4 text-slate-600">Carregando informações do agendamento…</p>;
  if (erro || !a) return <div className="space-y-3"><p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{erro || "Agendamento não encontrado."}</p><Link className="font-semibold text-[#1765A5]" href="/">Voltar ao painel</Link></div>;
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#F28C28]">Detalhes do atendimento</p><h1 className="mt-1 text-2xl font-extrabold text-[#123B60]">{a.cliente}</h1></div><Link href={`/agendamentos/${id}/editar`} className="rounded-xl bg-[#1765A5] px-4 py-2.5 text-sm font-bold text-white">Editar agendamento</Link></div>
    <section className="space-y-3"><h2 className="text-lg font-bold text-[#123B60]">Informações do atendimento</h2><div className="grid gap-3 sm:grid-cols-2">{campo("Serviço",a.services?.nome)}{campo("Profissional responsável",a.professionals?.nome)}{campo("Data",a.data?br(a.data):"")}{campo("Horário",a.horario?hh(a.horario):"")}</div></section>
    <section className="space-y-3"><h2 className="text-lg font-bold text-[#123B60]">Dados do cliente</h2><div className="grid gap-3 sm:grid-cols-2">{campo("Nome completo",a.cliente)}{campo("CPF/CNPJ",a.cpf_cnpj)}{campo("Telefone",a.telefone)}{campo("Endereço",end(a))}{campo("Complemento",a.complemento)}</div></section>
    <section className="space-y-3"><h2 className="text-lg font-bold text-[#123B60]">Observações adicionais</h2>{campo("Observações",a.observacoes)}</section>
    <Link href="/" className="inline-block font-semibold text-[#1765A5]">← Voltar ao painel</Link>
  </div>;
}
