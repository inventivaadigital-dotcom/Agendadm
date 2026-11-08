"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Q, br, hh, end, btn, btn2 } from "@/lib/util";

export default function Comp({ params }: { params: { id: string } }) {
  const [a, setA] = useState<any>(null);
  const [compartilhando, setCompartilhando] = useState(false);
  const [erroCompartilhamento, setErroCompartilhamento] = useState("");

  useEffect(() => {
    supabase().from("appointments").select(Q).eq("id", params.id).single().then((x) => setA(x.data));
  }, [params.id]);

  async function enviarWhatsApp() {
    if (!a || compartilhando) return;
    setCompartilhando(true);
    setErroCompartilhamento("");
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const largura = pdf.internal.pageSize.getWidth();
      const margem = 18;
      let y = 18;

      pdf.setFillColor(17, 43, 67);
      pdf.roundedRect(12, 12, largura - 24, 39, 4, 4, "F");

      try {
        const respostaLogo = await fetch("/logo.jpg");
        if (respostaLogo.ok) {
          const logoBlob = await respostaLogo.blob();
          const logoData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error("Não foi possível carregar a logo."));
            reader.readAsDataURL(logoBlob);
          });
          pdf.addImage(logoData, "JPEG", margem, 18, 26, 26);
        }
      } catch {
        // O comprovante continua sendo gerado mesmo se a imagem não carregar.
      }

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(15);
      pdf.text("DEDETIZADORA MARCONDES", 50, 27);
      pdf.setTextColor(244, 153, 65);
      pdf.setFontSize(10);
      pdf.text("COMPROVANTE DE AGENDAMENTO", 50, 35);

      y = 65;
      const campo = (titulo: string, valor: unknown) => {
        if (valor === null || valor === undefined || String(valor).trim() === "") return;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(17, 43, 67);
        pdf.text(titulo + ":", margem, y);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(45, 55, 65);
        const linhas = pdf.splitTextToSize(String(valor), largura - margem * 2 - 55);
        pdf.text(linhas, margem + 55, y);
        y += Math.max(8, linhas.length * 5 + 3);
        if (y > 255) {
          pdf.addPage();
          y = 22;
        }
      };

      campo("Cliente", a.cliente);
      campo("Serviço", a.services?.nome || "Não informado");
      campo("Data", br(a.data));
      campo("Horário", hh(a.horario));
      campo("Profissional", a.professionals?.nome || "Não informado");
      campo("Telefone do profissional", a.professionals?.telefone || "Não informado");
      if (a.professionals?.cargo) campo("Função", a.professionals.cargo);
      campo("Endereço", end(a));
      if (a.telefone) campo("Telefone do cliente", a.telefone);

      y += 5;
      pdf.setFillColor(242, 245, 247);
      pdf.roundedRect(margem, y, largura - margem * 2, 43, 3, 3, "F");
      pdf.setTextColor(17, 43, 67);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text("Seu horário foi reservado com sucesso!", margem + 6, y + 9);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      const mensagem = "Pedimos a gentileza de que, caso ocorra algum imprevisto, nos avise com antecedência para que possamos reorganizar nossa agenda. Agradecemos pela preferência! Dedetizadora Marcondes.";
      pdf.text(pdf.splitTextToSize(mensagem, largura - margem * 2 - 12), margem + 6, y + 17);

      const nomeArquivo = "Comprovante-" + String(a.cliente || "Agendamento").replace(/[^a-zA-Z0-9-]/g, "-") + ".pdf";
      const blob = pdf.output("blob");
      const arquivo = new File([blob], nomeArquivo, { type: "application/pdf" });
      const texto = "Olá! Segue o comprovante do seu agendamento com a Dedetizadora Marcondes.";

      if (typeof navigator.share === "function" && typeof navigator.canShare === "function" && navigator.canShare({ files: [arquivo] })) {
        await navigator.share({ files: [arquivo], title: "Comprovante de agendamento", text: texto });
      } else {
        pdf.save(nomeArquivo);
        window.location.href = "https://wa.me/?text=" + encodeURIComponent(texto + " O comprovante em PDF foi baixado; anexe-o nesta conversa.");
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setErroCompartilhamento("Não foi possível abrir o compartilhamento. Tente novamente ou use Salvar em PDF.");
      }
    } finally {
      setCompartilhando(false);
    }
  }

  if (!a) return <p>Carregando...</p>;
  const li = (t: string, v: string) => <p><b className="text-marinho">{t}:</b> {v}</p>;
  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap gap-2">
        <button className={btn} onClick={() => window.print()}>Imprimir</button>
        <button className={btn2} onClick={() => window.print()}>Salvar em PDF</button>
        <button className={btn} onClick={enviarWhatsApp} disabled={compartilhando}>
          {compartilhando ? "Preparando PDF..." : "Enviar comprovante pelo WhatsApp"}
        </button>
        <Link className={btn2} href="/">Voltar ao painel</Link>
        {erroCompartilhamento && <p className="w-full text-sm font-medium text-red-600">{erroCompartilhamento}</p>}
      </div>
      <div className="mx-auto max-w-lg overflow-hidden rounded-2xl border-2 border-azul">
        <div className="bg-marinho p-4 text-center text-white"><img src="/logo.jpg" alt="Dedetizadora Marcondes" className="mx-auto h-24 w-24 rounded-full" /><h1 className="mt-2 text-xl font-bold">DEDETIZADORA MARCONDES</h1><p className="text-laranja">COMPROVANTE DE AGENDAMENTO</p></div>
        <div className="space-y-1 p-5">
          {li("Cliente", a.cliente)}{li("Serviço", a.services?.nome)}{li("Data", br(a.data))}{li("Horário", hh(a.horario))}{li("Profissional responsável", a.professionals?.nome)}{li("Telefone do profissional", a.professionals?.telefone || "Não informado")}{a.professionals?.cargo && li("Função", a.professionals.cargo)}{li("Endereço", end(a))}{a.telefone && li("Telefone", a.telefone)}
          <div className="mt-4 rounded-xl bg-gelo p-4 text-sm"><p className="font-semibold">Seu horário foi reservado com sucesso!</p><p className="mt-2">Pedimos a gentileza de que, caso ocorra algum imprevisto, nos avise com antecedência para que possamos reorganizar nossa agenda.</p><p className="mt-2">Agradecemos pela preferência!</p><p className="mt-2 font-semibold">Dedetizadora Marcondes.</p></div>
        </div>
      </div>
    </div>
  );
}
