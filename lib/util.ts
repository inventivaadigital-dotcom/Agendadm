"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase/client";
export const hoje = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
export const br = (d: string) => d.split("-").reverse().join("/");
export const hh = (t: string) => t.slice(0, 5);
export const end = (a: any) => [`${a.rua}, ${a.numero}`, a.complemento, a.bairro, a.cidade].filter(Boolean).join(" – ");
export const Q = "*, services(nome), professionals(nome, telefone)";
export const inp = "w-full rounded-xl border border-gray-200 bg-gelo px-3 py-2.5 outline-none focus:border-azul";
export const btn = "rounded-xl bg-laranja px-4 py-2.5 font-semibold text-white";
export const btn2 = "rounded-xl border border-azul px-4 py-2.5 text-azul";
export function useAtivos(t: "professionals" | "services") {
  const [r, setR] = useState<any[]>([]);
  useEffect(() => { supabase().from(t).select("*").eq("ativo", true).order("nome").then((x) => setR(x.data || [])); }, [t]);
  return r;
}
