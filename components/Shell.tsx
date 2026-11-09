"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Versiculo from "./Versiculo";
const nav=[ ["/","Início"],["/agenda","Agenda mensal"],["/agendamentos","Agendamentos"] ];
export default function Shell({children}:{children:React.ReactNode}){
 const path=usePathname();const[menu,setMenu]=useState(false);const[splash,setSplash]=useState(true);useEffect(()=>{const t=window.setTimeout(()=>setSplash(false),1800);return()=>window.clearTimeout(t)},[]);
 return <><div className="mx-auto max-w-6xl px-3 py-4 sm:px-5">
 <header className="no-print mb-4 flex flex-wrap items-center gap-3 rounded-3xl border border-white/70 bg-white/95 p-3 shadow-lg">
 <img src="/logo.jpg" alt="Dedetizadora Marcondes" className="h-14 w-14 rounded-full object-cover"/>
 <div className="min-w-0 flex-1"><p className="font-extrabold tracking-wide text-[#123B60]">DEDETIZADORA MARCONDES</p><p className="text-sm text-slate-500">Agendamentos · Equipe</p></div>
 <div className="relative"><button aria-label="Abrir menu" onClick={()=>setMenu(!menu)} className="rounded-xl border px-3 py-2.5 text-xl text-[#123B60]">⋮</button>{menu&&<div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border bg-white p-2 shadow-xl">
 <Link onClick={()=>setMenu(false)} href="/clientes" className="block rounded-xl px-3 py-3 font-semibold hover:bg-slate-50">Clientes</Link><Link onClick={()=>setMenu(false)} href="/clientes-atendidos" className="block rounded-xl px-3 py-3 font-semibold hover:bg-slate-50">Clientes atendidos</Link><Link onClick={()=>setMenu(false)} href="/profissionais" className="block rounded-xl px-3 py-3 font-semibold hover:bg-slate-50">Profissionais</Link><Link onClick={()=>setMenu(false)} href="/contratos" className="block rounded-xl px-3 py-3 font-semibold hover:bg-slate-50">Contratos atendidos</Link><Link onClick={()=>setMenu(false)} href="/servicos" className="block rounded-xl px-3 py-3 font-semibold hover:bg-slate-50">Serviços</Link><Link onClick={()=>setMenu(false)} href="/configuracoes" className="block rounded-xl px-3 py-3 font-semibold hover:bg-slate-50">Configurações</Link>
 </div>}</div></header>
 <nav className="no-print mb-4 flex gap-2 overflow-x-auto pb-1">{nav.map(([href,label])=><Link key={href} href={href} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${path===href?"bg-[#1765A5] text-white":"bg-white/95 text-[#123B60]"}`}>{label}</Link>)}</nav>
 <main className="min-h-[65vh] rounded-3xl border border-white/70 bg-white/95 p-4 shadow-lg sm:p-6">{children}</main><Versiculo/>
 </div>{splash&&<div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#123B60] px-8 text-center text-white"><img src="/logo.jpg?v=5" alt="Dedetizadora Marcondes" className="mb-6 h-40 w-40 rounded-full border-4 border-[#F28C28] object-cover shadow-2xl"/><h1 className="text-2xl font-extrabold tracking-wide">AGENDAMENTOS</h1><p className="mt-5 max-w-md text-sm leading-relaxed text-white/90">“Tudo o que fizerem, façam de todo o coração, como para o Senhor, e não para os homens...”</p><p className="mt-2 text-xs font-semibold tracking-widest text-[#F28C28]">COLOSSENSES 3:23</p></div>}</>;
}
