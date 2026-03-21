import { prisma } from "../../config/prisma";
import { NotificationService } from "../notifications/notification.service";

export class AppointmentService {
  static async create(data: any, tenantId: string) {
    const { professionalId, startTime, endTime } = data;

    const start = new Date(startTime);
    const end = new Date(endTime);

    const dayOfWeek = start.getDay();


    const schedule = await prisma.schedule.findFirst({
      where: {
        professionalId,
        dayOfWeek,
      },
    });


    if (!schedule) {
      throw new Error("Professional does not work on this day");
    }

    const startHour = start.toISOString().slice(11, 16);
    const endHour = end.toISOString().slice(11, 16);

    if (startHour < schedule.startTime || endHour > schedule.endTime) {
      throw new Error("Appointment outside professional working hours");
    }

    const overlapping = await prisma.appointment.findFirst({
      where: {
        tenantId,
        professionalId,
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });

    if (overlapping) {
      throw new Error(
        "Professional already has an appointment in this time range",
      );
    }

    const appointment = await prisma.appointment.create({
      data: { ...data, tenantId },
      include: {
        patient: { select: { id: true, name: true } },
        professional: { select: { id: true, name: true } },
        appointmentType: { select: { id: true, name: true } },
      },
    });

    // Notificar al doctor asignado si tiene usuario vinculado
    const doctorUserId = await NotificationService.getUserIdByProfessional(appointment.professionalId);
    if (doctorUserId) {
      const date = appointment.startTime.toLocaleDateString("es-CO", { dateStyle: "medium" });
      const time = appointment.startTime.toLocaleTimeString("es-CO", { timeStyle: "short" });
      await NotificationService.notifyUser(
        tenantId,
        doctorUserId,
        "APPOINTMENT_CREATED",
        "Nueva cita agendada",
        `Tienes una nueva cita con ${appointment.patient.name} el ${date} a las ${time}.`,
        { appointmentId: appointment.id, patientId: appointment.patientId }
      );
    }

    // Notificar a admin y recepcionistas
    await NotificationService.notifyRole(
      tenantId,
      ["ADMIN", "RECEPTIONIST"],
      "APPOINTMENT_CREATED",
      "Nueva cita agendada",
      `Se agendó una cita para ${appointment.patient.name} con ${appointment.professional.name}.`,
      { appointmentId: appointment.id, patientId: appointment.patientId }
    );

    return appointment;
  }

  static async findAll(tenantId: string) {
    return prisma.appointment.findMany({
      where: { tenantId },
      include: {
        patient: true,
        professional: true,
        appointmentType: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });
  }

  static async findById(id: string, tenantId: string) {
    return prisma.appointment.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        patient: true,
        professional: true,
        appointmentType: true,
      },
    });
  }

  static async update(id: string, data: any, tenantId: string) {
    const updated = await prisma.appointment.update({
      where: { id },
      data,
      include: {
        patient: { select: { id: true, name: true } },
        professional: { select: { id: true, name: true } },
      },
    });

    const doctorUserId = await NotificationService.getUserIdByProfessional(updated.professionalId);

    if (data.status === "CANCELLED") {
      const body = `La cita de ${updated.patient.name} ha sido cancelada.`;
      if (doctorUserId) {
        await NotificationService.notifyUser(tenantId, doctorUserId, "APPOINTMENT_CANCELLED", "Cita cancelada", body, { appointmentId: id });
      }
      await NotificationService.notifyRole(tenantId, ["ADMIN", "RECEPTIONIST"], "APPOINTMENT_CANCELLED", "Cita cancelada", body, { appointmentId: id });
    } else if (data.startTime || data.endTime) {
      const body = `La cita de ${updated.patient.name} ha sido reprogramada.`;
      if (doctorUserId) {
        await NotificationService.notifyUser(tenantId, doctorUserId, "APPOINTMENT_RESCHEDULED", "Cita reprogramada", body, { appointmentId: id });
      }
      await NotificationService.notifyRole(tenantId, ["ADMIN", "RECEPTIONIST"], "APPOINTMENT_RESCHEDULED", "Cita reprogramada", body, { appointmentId: id });
    }

    return updated;
  }

  static async delete(id: string, tenantId: string) {
    return prisma.appointment.deleteMany({
      where: {
        id,
        tenantId,
      },
    });
  }

  static async getCalendar(
  tenantId: string,
  professionalId: string,
  startDate: string,
  endDate: string
) {

  const start = new Date(startDate);
  start.setHours(0,0,0,0);

  const end = new Date(endDate);
  end.setHours(23,59,59,999);

  return prisma.appointment.findMany({
    where: {
      tenantId,
      professionalId,
      startTime: {
        gte: start,
        lte: end
      }
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true
        }
      },
      professional: {
        select: {
          id: true,
          name: true
        }
      },
      appointmentType: {
        select: {
          id: true,
          name: true,
          durationMinutes: true
        }
      }
    },
    orderBy: {
      startTime: "asc"
    }
  });

}
}
