"use client";
import {useEffect,useState} from "react";
import {supabase} from "@/lib/supabase/client";
import {inp,btn,btn2} from "@/lib/util";

const msg=`Seu horário foi reservado com sucesso!

Pedimos a gentileza de que, caso ocorra algum imprevisto, nos avise com antecedência para que possamos reorganizar nossa agenda.

Agradecemos pela preferência!

Dedetizadora Marcondes.`;

function chavePublicaBytes(base64:string) {
 const padding="=".repeat((4-base64.length%4)%4);
 const raw=atob((base64+padding).replace(/-/g,"+").replace(/_/g,"/"));
 const bytes=new Uint8Array(raw.length);
 for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
 return bytes;
}

export default function Config(){
 const [nome,setNome]=useState("Dedetizadora Marcondes");
 const [texto,setTexto]=useState(msg);
 const [status,setStatus]=useState("");
 const [pushStatus,setPushStatus]=useState("");
 const [ativando,setAtivando]=useState(false);

 useEffect(()=>{
  supabase().from("company_settings").select("nome,mensagem_comprovante").eq("id",1).maybeSingle().then(({data})=>{
   if(data){setNome(data.nome);if(data.mensagem_comprovante)setTexto(data.mensagem_comprovante)}
  });
 },[]);

 async function save(){
  const {error}=await supabase().from("company_settings").upsert({id:1,nome,mensagem_comprovante:texto});
  setStatus(error?"Não foi possível salvar as configurações.":"Configurações salvas.");
 }

 async function ativarNotificacoes(){
  setAtivando(true);setPushStatus("");
  try{
   if(!("serviceWorker" in navigator)||!("PushManager" in window)||!("Notification" in window)){
    setPushStatus("Este navegador não oferece suporte a notificações push.");
    return;
   }
   const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
   const standalone=window.matchMedia("(display-mode: standalone)").matches||(navigator as any).standalone===true;
   if(ios&&!standalone){
    setPushStatus("No iPhone, primeiro adicione o Agendamentos à Tela de Início pelo Safari e abra pelo ícone. Depois volte aqui para ativar.");
    return;
   }
   const publicKey=process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
   if(!publicKey){setPushStatus("A configuração de notificações ainda não foi concluída no servidor.");return;}
   const permission=await Notification.requestPermission();
   if(permission!=="granted"){setPushStatus("Permissão não concedida. Ative as notificações do Agendamentos nas configurações do navegador ou do iPhone.");return;}
   const registration=await navigator.serviceWorker.ready;
   const existing=await registration.pushManager.getSubscription();
   const subscription=existing||await registration.pushManager.subscribe({
    userVisibleOnly:true,
    applicationServerKey:chavePublicaBytes(publicKey) as BufferSource
   });
   const {error}=await supabase().from("push_subscriptions").insert({
    endpoint:subscription.endpoint,
    subscription:subscription.toJSON(),
    updated_at:new Date().toISOString()
   });
   if(error && error.code!=="23505")throw error;
   setPushStatus("Notificações ativadas neste aparelho. Os avisos serão enviados 2 horas antes dos agendamentos.");
  }catch(error:any){
   setPushStatus("Não foi possível ativar as notificações: "+(error?.message||"tente novamente."));
  }finally{setAtivando(false)}
 }

 return <div className="max-w-2xl space-y-5">
  <h1 className="text-2xl font-bold">Configurações</h1>
  <section className="space-y-3 rounded-2xl border border-slate-200 p-4">
   <h2 className="font-bold text-[#123B60]">Notificações de agendamento</h2>
   <p className="text-sm text-slate-600">Ative neste aparelho para receber um aviso 2 horas antes de cada atendimento. A permissão precisa ser concedida em cada celular ou computador.</p>
   <button className={btn} onClick={ativarNotificacoes} disabled={ativando}>{ativando?"Ativando...":"Ativar notificações neste aparelho"}</button>
   {pushStatus&&<p role="status" className="rounded-xl bg-blue-50 p-3 text-sm text-[#123B60]">{pushStatus}</p>}
   <p className="text-xs text-slate-500">No iPhone, o app precisa estar adicionado à Tela de Início e ser aberto pelo ícone. A vibração é controlada pelo iOS; o padrão longo é solicitado, mas o sistema pode não permitir personalizar sua duração.</p>
  </section>
  <section className="space-y-3">
   <h2 className="font-bold text-[#123B60]">Dados da empresa e comprovante</h2>
   <label className="block text-sm font-medium">Nome da empresa<input className={inp+" mt-1"} value={nome} onChange={e=>setNome(e.target.value)}/></label>
   <label className="block text-sm font-medium">Mensagem do comprovante<textarea className={inp+" mt-1 min-h-40"} value={texto} onChange={e=>setTexto(e.target.value)}/></label>
   <button className={btn2} onClick={save}>Salvar alterações</button>
   {status&&<p role="status">{status}</p>}
  </section>
 </div>;
}