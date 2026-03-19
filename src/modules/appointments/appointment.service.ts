import { prisma } from "../../config/prisma";

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

    return prisma.appointment.create({
      data: {
        ...data,
        tenantId,
      },
      include: {
        patient: true,
        professional: true,
        appointmentType: true,
      },
    });
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
    return prisma.appointment.updateMany({
      where: {
        id,
        tenantId,
      },
      data,
    });
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
