"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { end, inp } from "@/lib/util";

export default function Clientes() {
  const [rows, setRows] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  async function carregar() {
    setLoading(true);
    const { data, error } = await supabase().from("clients").select("*").order("nome");
    if (error) { setErro("Não foi possível carregar os clientes: " + error.message); setRows([]); }
    else { setErro(""); setRows(data || []); }
    setLoading(false);
  }
  useEffect(() => { carregar(); }, []);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLocaleLowerCase("pt-BR");
    if (!q) return rows;
    return rows.filter(c => [c.nome,c.telefone,c.cpf_cnpj,c.rua,c.numero,c.bairro,c.cidade].some(v => String(v || "").toLocaleLowerCase("pt-BR").includes(q)));
  }, [rows,busca]);

  async function excluir(c: any) {
    if (!confirm(`Apagar o cadastro de ${c.nome}? Os agendamentos antigos serão preservados, mas deixarão de estar vinculados ao cadastro do cliente.`)) return;
    const { error } = await supabase().from("clients").delete().eq("id", c.id);
    if (error) { setErro("Não foi possível apagar o cliente: " + error.message); return; }
    setAviso("Cadastro do cliente apagado. O histórico de agendamentos foi preservado.");
    await carregar();
  }

  return <div className="space-y-4">
    <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#F28C28]">Cadastro de clientes</p><h1 className="text-2xl font-extrabold text-[#123B60]">Clientes</h1><p className="text-sm text-slate-500">Os clientes são registrados automaticamente quando um agendamento é salvo. Cadastros repetidos são reunidos pelo CPF/CNPJ ou telefone.</p></div>
    <input className={inp} placeholder="Buscar por nome, telefone, CPF/CNPJ ou endereço" value={busca} onChange={e=>setBusca(e.target.value)} />
    <div className="rounded-2xl bg-blue-50 p-3 text-sm text-[#123B60]"><b>{filtrados.length}</b> cliente(s) encontrado(s) · {rows.length} cadastrado(s)</div>
    {aviso && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{aviso}</p>}
    {erro && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{erro}</p>}
    {loading && <p className="text-sm text-slate-500">Carregando clientes...</p>}
    {!loading && !erro && !filtrados.length && <div className="rounded-2xl border border-dashed p-6 text-center text-slate-500">Nenhum cliente encontrado.</div>}
    <div className="grid gap-3 sm:grid-cols-2">
      {filtrados.map(c=><article key={c.id} className="space-y-3 rounded-2xl border border-slate-200 p-4">
        <div><h2 className="font-bold text-lg text-[#123B60]">{c.nome}</h2><p className="text-sm text-slate-600">{c.telefone || "Telefone não informado"}</p></div>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <p><b>CPF/CNPJ:</b> {c.cpf_cnpj || "Não informado"}</p>
          <p><b>Endereço:</b> {end(c) || "Não informado"}</p>
          {c.complemento && <p className="sm:col-span-2"><b>Complemento:</b> {c.complemento}</p>}
        </div>
        <button onClick={()=>excluir(c)} className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700">Apagar cliente</button>
      </article>)}
    </div>
  </div>;
}