import { prisma } from "../../config/prisma";
import { PrescriptionStatus } from "@prisma/client";

export class PrescriptionService {
  static async create(data: any, tenantId: string) {
    const { patientId, professionalId, appointmentId, diagnosis, notes, items } = data;

    if (!items || items.length === 0) {
      throw new Error("Prescription must have at least one item");
    }

    return prisma.prescription.create({
      data: {
        tenantId,
        patientId,
        professionalId,
        appointmentId: appointmentId ?? null,
        diagnosis: diagnosis ?? null,
        notes: notes ?? null,
        items: {
          create: items.map((item: any) => ({
            medication: item.medication,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration ?? null,
            instructions: item.instructions ?? null,
          })),
        },
      },
      include: {
        patient: { select: { id: true, name: true } },
        professional: { select: { id: true, name: true } },
        items: true,
      },
    });
  }

  static async findAll(tenantId: string) {
    return prisma.prescription.findMany({
      where: { tenantId },
      include: {
        patient: { select: { id: true, name: true } },
        professional: { select: { id: true, name: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findById(id: string, tenantId: string) {
    return prisma.prescription.findFirst({
      where: { id, tenantId },
      include: {
        patient: true,
        professional: true,
        appointment: true,
        items: true,
      },
    });
  }

  static async signDoctor(id: string, signature: string, tenantId: string) {
    const prescription = await prisma.prescription.findFirst({ where: { id, tenantId } });

    if (!prescription) throw new Error("Prescription not found");
    if (prescription.status !== PrescriptionStatus.DRAFT) {
      throw new Error("Only DRAFT prescriptions can be signed by the doctor");
    }

    return prisma.prescription.update({
      where: { id },
      data: { doctorSignature: signature, status: PrescriptionStatus.DOCTOR_SIGNED },
    });
  }

  static async signPatient(id: string, signature: string, fingerprint: string, tenantId: string) {
    const prescription = await prisma.prescription.findFirst({ where: { id, tenantId } });

    if (!prescription) throw new Error("Prescription not found");
    if (prescription.status !== PrescriptionStatus.DOCTOR_SIGNED) {
      throw new Error("Doctor must sign before the patient");
    }

    return prisma.prescription.update({
      where: { id },
      data: {
        patientSignature: signature,
        fingerprint,
        status: PrescriptionStatus.PATIENT_SIGNED,
      },
    });
  }

  static async finalize(id: string, tenantId: string) {
    const prescription = await prisma.prescription.findFirst({ where: { id, tenantId } });

    if (!prescription) throw new Error("Prescription not found");
    if (prescription.status !== PrescriptionStatus.PATIENT_SIGNED) {
      throw new Error("Prescription must be signed by both parties before finalizing");
    }

    return prisma.prescription.update({
      where: { id },
      data: { status: PrescriptionStatus.FINALIZED, finalizedAt: new Date() },
    });
  }

  static async findByPatient(patientId: string, tenantId: string) {
    return prisma.prescription.findMany({
      where: { patientId, tenantId },
      include: {
        professional: { select: { id: true, name: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
