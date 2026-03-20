import twilio from "twilio";
import { prisma } from "../../config/prisma";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

function buildMessage(
  patientName: string,
  date: Date,
  doctorName: string,
  clinicName: string
): string {
  const formatted = date.toLocaleString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `Hola ${patientName}, le recordamos su cita el ${formatted} con ${doctorName}. Clínica ${clinicName}.`;
}

export class ReminderService {
  static async sendManual(appointmentId: string, tenantId: string) {
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, tenantId },
      include: {
        patient: true,
        professional: true,
      },
    });

    if (!appointment) throw new Error("Appointment not found");
    if (!appointment.patient.phone)
      throw new Error("Patient does not have a phone number registered");

    const clinic = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!clinic) throw new Error("Clinic not found");

    const message = buildMessage(
      appointment.patient.name,
      appointment.startTime,
      appointment.professional.name,
      clinic.name
    );

    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: appointment.patient.phone,
    });

    const reminder = await prisma.reminder.create({
      data: {
        tenantId,
        appointmentId,
        type: "SMS",
        status: "SENT",
        message,
      },
    });

    return reminder;
  }

  static async findByAppointment(appointmentId: string, tenantId: string) {
    return prisma.reminder.findMany({
      where: { appointmentId, tenantId },
      orderBy: { sentAt: "desc" },
    });
  }

  // Usado por el cron job — envía recordatorios a citas en las próximas `hoursAhead` horas
  static async sendAutomaticReminders(hoursAhead: number = 24) {
    const now = new Date();
    const windowStart = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
    const windowEnd = new Date(windowStart.getTime() + 60 * 60 * 1000); // ventana de 1 hora

    const appointments = await prisma.appointment.findMany({
      where: {
        startTime: { gte: windowStart, lte: windowEnd },
        status: { in: ["SCHEDULED", "CONFIRMED"] },
        patient: { phone: { not: null } },
      },
      include: {
        patient: true,
        professional: true,
        tenant: true,
        reminders: true,
      },
    });

    const results = { sent: 0, skipped: 0, failed: 0 };

    for (const appointment of appointments) {
      // Evitar duplicados: si ya tiene un SMS enviado hoy, saltar
      const alreadySent = appointment.reminders.some((r) => {
        const sentToday =
          new Date(r.sentAt).toDateString() === now.toDateString();
        return r.type === "SMS" && sentToday;
      });

      if (alreadySent) {
        results.skipped++;
        continue;
      }

      const message = buildMessage(
        appointment.patient.name,
        appointment.startTime,
        appointment.professional.name,
        appointment.tenant.name
      );

      try {
        await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: appointment.patient.phone!,
        });

        await prisma.reminder.create({
          data: {
            tenantId: appointment.tenantId,
            appointmentId: appointment.id,
            type: "SMS",
            status: "SENT",
            message,
          },
        });

        results.sent++;
      } catch {
        await prisma.reminder.create({
          data: {
            tenantId: appointment.tenantId,
            appointmentId: appointment.id,
            type: "SMS",
            status: "FAILED",
            message,
          },
        });
        results.failed++;
      }
    }

    return results;
  }
}
