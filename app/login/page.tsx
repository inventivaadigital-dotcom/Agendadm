"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Versiculo from "@/components/Versiculo";

const inp = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-base outline-none transition focus:border-[#1765A5] focus:ring-2 focus:ring-blue-100";

export default function Login() {
  const [modo, setModo] = useState<"entrar" | "cadastro">("entrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [aguardandoConfirmacao, setAguardandoConfirmacao] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(location.search).get("recovery") === "1") setResetMode(true);
    const { data } = supabase().auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setResetMode(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");

    if (resetMode) {
      const { error } = await supabase().auth.updateUser({ password: senha });
      if (error) setMsg("Não foi possível atualizar a senha. Solicite um novo link de recuperação.");
      else {
        setResetMode(false);
        setModo("entrar");
        setSenha("");
        setMsg("Senha atualizada. Entre com sua nova senha.");
      }
      setBusy(false);
      return;
    }

    if (modo === "entrar") {
      const { error } = await supabase().auth.signInWithPassword({ email: email.trim(), password: senha });
      if (error) setMsg("Não foi possível entrar. Confira o e-mail e a senha e, se necessário, confirme seu cadastro.");
      else location.href = "/";
    } else {
      if (nome.trim().length < 2) {
        setMsg("Informe seu nome completo.");
        setBusy(false);
        return;
      }
      const { data, error } = await supabase().auth.signUp({
        email: email.trim(),
        password: senha,
        options: { data: { full_name: nome.trim() }, emailRedirectTo: location.origin + "/" }
      });
      if (error) setMsg(error.message);
      else if (data.session) location.href = "/";
      else {
        setAguardandoConfirmacao(true);
        setMsg("Cadastro iniciado. Confira sua caixa de entrada e a pasta de spam para confirmar seu e-mail.");
      }
    }
    setBusy(false);
  }

  async function reenviarConfirmacao() {
    if (!email.trim()) {
      setMsg("Informe o e-mail usado no cadastro.");
      return;
    }
    setBusy(true);
    setMsg("");
    const { error } = await supabase().auth.resend({ type: "signup", email: email.trim(), options: { emailRedirectTo: location.origin + "/" } });
    setMsg(error
      ? "Não foi possível reenviar agora. Confira se o endereço está correto e tente novamente."
      : "Solicitação de reenvio realizada. Confira sua caixa de entrada e a pasta de spam.");
    setBusy(false);
  }

  async function recuperar() {
    if (!email.trim()) {
      setMsg("Digite seu e-mail para receber o link de recuperação.");
      return;
    }
    const { error } = await supabase().auth.resetPasswordForEmail(email.trim(), { redirectTo: location.origin + "/login?recovery=1" });
    setMsg(error ? "Não foi possível enviar o link." : "Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.");
  }

  function trocarModo(novoModo: "entrar" | "cadastro") {
    setModo(novoModo);
    setMsg("");
    setAguardandoConfirmacao(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-6">
      <form onSubmit={enviar} className="w-full max-w-lg space-y-5 rounded-3xl border border-white/70 bg-white/95 p-6 shadow-2xl backdrop-blur sm:p-9">
        <img src="/logo.jpg" alt="Dedetizadora Marcondes" className="mx-auto h-36 w-36 rounded-full object-cover shadow sm:h-40 sm:w-40" />
        <div className="space-y-1 text-center">
          <p className="text-sm font-bold uppercase tracking-[.22em] text-[#F28C28]">Área interna</p>
          <h1 className="text-3xl font-bold text-[#123B60] sm:text-4xl">Agendamentos</h1>
          <p className="text-base text-slate-500">Controle de atendimentos · Marcondes</p>
        </div>

        {!resetMode && (
          <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1.5">
            <button type="button" onClick={() => trocarModo("entrar")} className={`rounded-lg py-3 text-sm font-semibold sm:text-base ${modo === "entrar" ? "bg-white text-[#123B60] shadow" : "text-slate-500"}`}>Entrar</button>
            <button type="button" onClick={() => trocarModo("cadastro")} className={`rounded-lg py-3 text-sm font-semibold sm:text-base ${modo === "cadastro" ? "bg-white text-[#123B60] shadow" : "text-slate-500"}`}>Cadastro profissional</button>
          </div>
        )}

        {resetMode && <p className="rounded-xl bg-blue-50 p-4 text-base text-[#123B60]">Crie uma nova senha para sua conta.</p>}

        {!resetMode && modo === "cadastro" && (
          <label className="block text-base font-medium text-slate-700">Nome completo
            <input className={inp + " mt-2"} value={nome} onChange={e => setNome(e.target.value)} required autoComplete="name" placeholder="Seu nome completo" />
          </label>
        )}

        <label className="block text-base font-medium text-slate-700">E-mail
          <input className={inp + " mt-2"} type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="seuemail@exemplo.com" />
        </label>

        <label className="block text-base font-medium text-slate-700">Senha
          <input className={inp + " mt-2"} type="password" value={senha} onChange={e => setSenha(e.target.value)} minLength={6} required autoComplete={modo === "entrar" && !resetMode ? "current-password" : "new-password"} placeholder="Mínimo de 6 caracteres" />
        </label>

        {msg && <p role="status" className="rounded-xl bg-blue-50 p-4 text-sm leading-relaxed text-[#123B60] sm:text-base">{msg}</p>}

        <button disabled={busy} className="w-full rounded-xl bg-[#F28C28] py-4 text-base font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-60 sm:text-lg">
          {busy ? "Aguarde…" : resetMode ? "Salvar nova senha" : modo === "entrar" ? "Entrar no aplicativo" : "Criar acesso profissional"}
        </button>

        {!resetMode && modo === "entrar" && (
          <button type="button" onClick={recuperar} className="w-full py-2 text-base font-medium text-[#1765A5] underline">Esqueci minha senha</button>
        )}

        {!resetMode && modo === "cadastro" && aguardandoConfirmacao && (
          <button type="button" disabled={busy} onClick={reenviarConfirmacao} className="w-full rounded-xl border border-[#1765A5] px-4 py-3 text-base font-semibold text-[#1765A5] disabled:opacity-60">
            Reenviar e-mail de confirmação
          </button>
        )}

        {!resetMode && modo === "cadastro" && (
          <p className="text-center text-sm leading-relaxed text-slate-500">O cadastro cria acesso de profissional. Permissões administrativas não podem ser escolhidas nesta tela.</p>
        )}
      </form>
      <Versiculo />
    </main>
  );
}
