import cron from "node-cron";
import { ReminderService } from "../modules/reminders/reminder.service";

// Corre cada hora en punto, ej: 09:00, 10:00, 11:00...
// Busca citas que empiezan en las próximas 24 horas (ventana de 1h)
export function startReminderCron() {
  cron.schedule("0 * * * *", async () => {
    console.log("[ReminderCron] Checking appointments for reminders...");
    try {
      const results = await ReminderService.sendAutomaticReminders(24);
      console.log(
        `[ReminderCron] Sent: ${results.sent} | Skipped: ${results.skipped} | Failed: ${results.failed}`
      );
    } catch (error) {
      console.error("[ReminderCron] Error:", error);
    }
  });

  console.log("[ReminderCron] Scheduled — runs every hour");
}
