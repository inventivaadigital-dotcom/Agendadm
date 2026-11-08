import "./globals.css";
import PWARegister from "@/components/PWARegister";
export const metadata = { title: "Agendamentos | Dedetizadora Marcondes", description:"Controle interno de agendamentos da Dedetizadora Marcondes", manifest:"/manifest.json", applicationName:"Agendamentos Marcondes", icons:{icon:"/logo.jpg?v=5",apple:"/logo.jpg?v=5"} };
export const viewport = { themeColor: "#1765A5", width:"device-width", initialScale:1 };
export default function Root({ children }: { children: React.ReactNode }) { return <html lang="pt-BR"><body><PWARegister/>{children}</body></html>; }
