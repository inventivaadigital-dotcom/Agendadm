"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { inp, btn, btn2 } from "@/lib/util";
export default function Cadastro({ t, titulo, desc }: { t: "professionals" | "services"; titulo: string; desc?: boolean }) {
  const [rows, setRows] = useState<any[]>([]); const [nome, setNome] = useState(""); const [d, setD] = useState(""); const [msg, setMsg] = useState("");
  const load = () => supabase().from(t).select("*").order("nome").then((x) => setRows(x.data || []));
  useEffect(() => { load(); }, []);
  async function add() { if (!nome.trim()) return setMsg("Informe o nome."); const { error } = await supabase().from(t).insert(desc ? { nome: nome.trim(), descricao: d || null } : { nome: nome.trim() }); setMsg(error ? "Erro: " + error.message : ""); setNome(""); setD(""); load(); }
  async function up(id: string, v: any) { await supabase().from(t).update(v).eq("id", id); load(); }
  async function del(id: string) { if (!confirm("Excluir este cadastro?")) return; const { error } = await supabase().from(t).delete().eq("id", id); setMsg(error ? "Possui histórico de agendamentos e não pode ser excluído. Desative-o." : ""); load(); }
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">{titulo}</h1>
      <div className="flex flex-wrap gap-2"><input className={inp + " !w-60"} placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        {desc && <input className={inp + " !w-60"} placeholder="Descrição (opcional)" value={d} onChange={(e) => setD(e.target.value)} />}<button className={btn} onClick={add}>Adicionar</button></div>
      {msg && <p className="text-red-600">{msg}</p>}
      {rows.map((r) => (
        <div key={r.id} className="flex flex-wrap items-center gap-2 rounded-2xl border p-3">
          <div className="flex-1"><b className={r.ativo ? "" : "text-gray-400 line-through"}>{r.nome}</b>{r.descricao && <p className="text-sm text-gray-500">{r.descricao}</p>}</div>
          <button className={btn2} onClick={() => { const n = prompt("Novo nome:", r.nome); if (n?.trim()) up(r.id, { nome: n.trim() }); }}>Editar</button>
          <button className={btn2} onClick={() => up(r.id, { ativo: !r.ativo })}>{r.ativo ? "Desativar" : "Ativar"}</button>
          {t === "professionals" && <Link className={btn2} href={`/agendamentos?prof=${r.id}`}>Agendamentos</Link>}
          <button className={btn2} onClick={() => del(r.id)}>Excluir</button>
        </div>))}
    </div>
  );
}
