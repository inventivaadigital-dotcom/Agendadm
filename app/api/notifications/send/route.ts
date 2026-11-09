import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!supabaseUrl || !anonKey || !publicKey || !privateKey || !subject) {
    return Response.json({ error: "Notification configuration is incomplete" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-cron-secret": cronSecret } },
  });
  webpush.setVapidDetails(subject, publicKey, privateKey);

  const now = new Date();
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(now);
  const maxDay = new Date(`${today}T12:00:00-03:00`);
  maxDay.setUTCDate(maxDay.getUTCDate() + 30);
  const lastDate = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(maxDay);

  const [{ data: appointments, error: appointmentsError }, { data: subscriptions, error: subscriptionsError }] = await Promise.all([
    supabase.from("appointments").select("id,cliente,data,horario,services(nome)").gte("data", today).lte("data", lastDate),
    supabase.from("push_subscriptions").select("id,endpoint,subscription"),
  ]);

  if (appointmentsError) return Response.json({ error: appointmentsError.message }, { status: 500 });
  if (subscriptionsError) return Response.json({ error: subscriptionsError.message }, { status: 500 });

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const appointment of appointments || []) {
    const time = String(appointment.horario).slice(0, 5);
    const startsAt = new Date(`${appointment.data}T${time}:00-03:00`);
    const dueAt = new Date(startsAt.getTime() - 2 * 60 * 60 * 1000);
    if (dueAt.getTime() > now.getTime() || dueAt.getTime() <= now.getTime() - 5 * 60 * 1000) continue;
    const scheduledFor = dueAt.toISOString();

    for (const sub of subscriptions || []) {
      const claim = await supabase.from("appointment_notification_deliveries").insert({
        appointment_id: appointment.id,
        endpoint: sub.endpoint,
        scheduled_for: scheduledFor,
        status: "sending",
      });
      if (claim.error) {
        if (claim.error.code === "23505") skipped++;
        else failed++;
        continue;
      }

      const serviceName = Array.isArray(appointment.services) ? appointment.services[0]?.nome : (appointment.services as any)?.nome;
      const payload = JSON.stringify({
        title: "Agendamento em 2 horas",
        body: `${appointment.cliente} · ${time}${serviceName ? " · " + serviceName : ""}`,
        icon: "/icon-192.svg",
        badge: "/icon-192.svg",
        tag: `agendamento-${appointment.id}`,
        vibrate: [650, 250, 650, 250, 650],
        data: { url: `/agendamentos/${appointment.id}` },
      });

      try {
        await webpush.sendNotification(sub.subscription, payload, { TTL: 7200 });
        await supabase.from("appointment_notification_deliveries").update({ status: "sent", sent_at: new Date().toISOString() }).eq("appointment_id", appointment.id).eq("endpoint", sub.endpoint).eq("scheduled_for", scheduledFor);
        sent++;
      } catch (error: any) {
        await supabase.from("appointment_notification_deliveries").delete().eq("appointment_id", appointment.id).eq("endpoint", sub.endpoint).eq("scheduled_for", scheduledFor);
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        }
        failed++;
      }
    }
  }

  return Response.json({ ok: true, sent, skipped, failed });
}
