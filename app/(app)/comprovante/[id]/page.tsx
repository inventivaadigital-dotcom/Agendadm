"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Q, br, hh, end, btn, btn2 } from "@/lib/util";
export default function Comp({ params }: { params: { id: string } }) {
  const [a, setA] = useState<any>(null);
  useEffect(() => { supabase().from("appointments").select(Q).eq("id", params.id).single().then((x) => setA(x.data)); }, [params.id]);
  if (!a) return <p>Carregando...</p>;
  const li = (t: string, v: string) => <p><b className="text-marinho">{t}:</b> {v}</p>;
  return (
    <div>
      <div className="no-print mb-4 flex gap-2"><button className={btn} onClick={() => window.print()}>Imprimir</button><button className={btn2} onClick={() => window.print()}>Salvar em PDF</button><Link className={btn2} href="/">Voltar ao painel</Link></div>
      <div className="mx-auto max-w-lg overflow-hidden rounded-2xl border-2 border-azul">
        <div className="bg-marinho p-4 text-center text-white"><img src="/logo.jpg" alt="Dedetizadora Marcondes" className="mx-auto h-24 w-24 rounded-full" /><h1 className="mt-2 text-xl font-bold">DEDETIZADORA MARCONDES</h1><p className="text-laranja">COMPROVANTE DE AGENDAMENTO</p></div>
        <div className="space-y-1 p-5">
          {li("Cliente", a.cliente)}{li("Serviço", a.services?.nome)}{li("Data", br(a.data))}{li("Horário", hh(a.horario))}{li("Profissional responsável", a.professionals?.nome)}{li("Telefone do profissional", a.professionals?.telefone || "Não informado") }{li("Endereço", end(a))}{a.telefone && li("Telefone", a.telefone)}
          <div className="mt-4 rounded-xl bg-gelo p-4 text-sm"><p className="font-semibold">Seu horário foi reservado com sucesso!</p><p className="mt-2">Pedimos a gentileza de que, caso ocorra algum imprevisto, nos avise com antecedência para que possamos reorganizar nossa agenda.</p><p className="mt-2">Agradecemos pela preferência!</p><p className="mt-2 font-semibold">Dedetizadora Marcondes.</p></div>
        </div>
      </div>
    </div>
  );
}
