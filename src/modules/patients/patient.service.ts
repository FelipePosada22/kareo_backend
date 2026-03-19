import { prisma } from "../../config/prisma";

export class PatientService {
  static async create(data: any, tenantId: string) {
    return prisma.patient.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  static async findAll(tenantId: string) {
    return prisma.patient.findMany({
      where: {
        tenantId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async findById(id: string, tenantId: string) {
    return prisma.patient.findFirst({
      where: {
        id,
        tenantId,
      },
    });
  }

  static async update(id: string, data: any, tenantId: string) {
    return prisma.patient.updateMany({
      where: {
        id,
        tenantId,
      },
      data,
    });
  }

  static async findAppointments(id: string, tenantId: string) {
    return prisma.appointment.findMany({
      where: { patientId: id, tenantId },
      include: {
        professional: { select: { id: true, name: true, specialty: true } },
        appointmentType: { select: { id: true, name: true, durationMinutes: true, price: true } },
      },
      orderBy: { startTime: "desc" },
    });
  }

  static async findInvoices(id: string, tenantId: string) {
    return prisma.invoice.findMany({
      where: { patientId: id, tenantId },
      include: {
        items: true,
        payments: true,
        appointment: {
          select: {
            id: true,
            startTime: true,
            appointmentType: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}