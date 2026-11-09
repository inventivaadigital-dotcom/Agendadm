import Link from "next/link";
import { br, hh, end } from "@/lib/util";

export default function Card({a,data,onAttend}:{a:any;data?:boolean;onAttend?:(id:string)=>void}) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#1765A5] hover:shadow-md">
    <Link href={`/agendamentos/${a.id}`} className="block">
      <div className="flex items-start justify-between gap-3"><b className="text-lg text-[#123B60]">{a.cliente}</b><b className="shrink-0 text-lg text-[#1765A5]">{data&&br(a.data)+" · "}{hh(a.horario)}</b></div>
      <p className="mt-1 text-sm text-slate-600">{a.services?.nome||"Serviço"} · {a.professionals?.nome||"Profissional"}</p>
      <p className="mt-2 text-sm text-slate-700">{end(a)}</p>
      {a.telefone&&<p className="mt-1 text-sm text-slate-500">{a.telefone}</p>}
      <p className="mt-3 text-xs font-semibold text-[#1765A5]">Ver informações completas →</p>
    </Link>
    {onAttend&&<button type="button" onClick={()=>onAttend(a.id)} className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700">✓ Marcar como atendido</button>}
  </article>;
}
