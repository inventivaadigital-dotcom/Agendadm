# Agendamentos — Dedetizadora Marcondes

Aplicativo interno de agendamentos, desenvolvido com Next.js, React, TypeScript, Tailwind CSS e Supabase.

## Recursos
- Login, recuperação de senha e cadastro de profissionais.
- Perfil administrador reconhecido pelo cadastro do e-mail `ddtmarcondes@gmail.com` no gatilho do Supabase.
- Profissionais acessam e gerenciam apenas seus próprios atendimentos; o administrador gerencia a equipe, serviços e agenda geral.
- Painel diário, resumo semanal, calendário mensal, pesquisa e filtros.
- Cadastro/edição de agendamentos e comprovante imprimível / exportável em PDF pelo navegador.
- Bloqueio de dois horários iguais para o mesmo profissional na mesma data.
- Bloqueio de telefone já associado a outro nome de cliente.
- PWA com manifesto e service worker.

## Executar
1. Instale Node.js 20 ou 22.
2. Copie `.env.example` para `.env.local` e preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` com os valores do projeto Supabase.
3. Execute `npm install` e `npm run dev`.
4. Para produção, execute `npm run build` e publique na Vercel.

## Supabase
O projeto Supabase associado já contém as tabelas de perfis, profissionais, serviços, configurações e agendamentos, com RLS/RBAC provisionado. A migration `supabase/migrations/20261105_clients_and_signup.sql` documenta a tabela de clientes e a validação de telefone que foram adicionadas ao banco conectado.

**Cadastro imediato:** no painel Supabase, em Authentication → Providers → Email, desative a confirmação de e-mail para permitir que profissionais entrem imediatamente após o cadastro. A aplicação não solicita nem armazena senha fora do Supabase Auth.

## Observações
- O horário é salvo como hora local e a data exibida em formato brasileiro.
- O conflito de agenda considera o mesmo horário de início. Durações de serviços não foram definidas; quando houver uma regra de duração, a validação poderá ser ampliada para intervalos sobrepostos.
- O comprovante é gerado no navegador; selecione “Salvar como PDF” na janela de impressão.
- Nunca adicione `.env.local`, `.env.production` ou chaves secretas ao Git.
