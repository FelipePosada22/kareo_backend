import { prisma } from "../../config/prisma";
import { TreatmentPlanStatus, TreatmentPlanItemStatus } from "@prisma/client";
import { NotificationService } from "../notifications/notification.service";

export class TreatmentPlanService {
  static async create(data: any, tenantId: string) {
    const { patientId, title, notes, items } = data;

    if (!items || items.length === 0) {
      throw new Error("Treatment plan must have at least one item");
    }

    const plan = await prisma.treatmentPlan.create({
      data: {
        tenantId,
        patientId,
        title,
        notes: notes ?? null,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            price: item.price,
            notes: item.notes ?? null,
          })),
        },
      },
      include: { items: true, patient: { select: { id: true, name: true } } },
    });

    await NotificationService.notifyRole(
      tenantId,
      ["ADMIN", "RECEPTIONIST", "DOCTOR"],
      "TREATMENT_PLAN_CREATED",
      "Nuevo plan de tratamiento",
      `Se creó el plan "${title}" para ${plan.patient.name}.`,
      { treatmentPlanId: plan.id, patientId }
    );

    return plan;
  }

  static async findAll(tenantId: string) {
    return prisma.treatmentPlan.findMany({
      where: { tenantId },
      include: {
        patient: { select: { id: true, name: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findById(id: string, tenantId: string) {
    return prisma.treatmentPlan.findFirst({
      where: { id, tenantId },
      include: {
        patient: true,
        items: { include: { appointment: true } },
        invoices: { include: { items: true, payments: true } },
      },
    });
  }

  static async updateItemStatus(itemId: string, status: TreatmentPlanItemStatus, tenantId: string) {
    const item = await prisma.treatmentPlanItem.findFirst({
      where: { id: itemId, treatmentPlan: { tenantId } },
      include: { treatmentPlan: { include: { items: true } } },
    });

    if (!item) throw new Error("Treatment plan item not found");

    const updated = await prisma.treatmentPlanItem.update({
      where: { id: itemId },
      data: { status },
    });

    // Recalcular estado del plan completo
    const allItems = item.treatmentPlan.items.map((i) =>
      i.id === itemId ? { ...i, status } : i
    );

    const allCompleted = allItems.every((i) => i.status === TreatmentPlanItemStatus.COMPLETED);
    const allCancelled = allItems.every((i) => i.status === TreatmentPlanItemStatus.CANCELLED);
    const someActive = allItems.some((i) =>
      i.status === TreatmentPlanItemStatus.PENDING || i.status === TreatmentPlanItemStatus.IN_PROGRESS
    );
    const mixedDone = !someActive && !allCompleted && !allCancelled;

    let planStatus: TreatmentPlanStatus = TreatmentPlanStatus.ACTIVE;
    if (allCompleted) planStatus = TreatmentPlanStatus.COMPLETED;
    else if (allCancelled) planStatus = TreatmentPlanStatus.CANCELLED;
    else if (mixedDone) planStatus = TreatmentPlanStatus.PARTIAL;

    await prisma.treatmentPlan.update({
      where: { id: item.treatmentPlanId },
      data: { status: planStatus },
    });

    return updated;
  }

  static async updateItem(itemId: string, data: any, tenantId: string) {
    const item = await prisma.treatmentPlanItem.findFirst({
      where: { id: itemId, treatmentPlan: { tenantId } },
    });

    if (!item) throw new Error("Treatment plan item not found");

    return prisma.treatmentPlanItem.update({
      where: { id: itemId },
      data: {
        description: data.description,
        price: data.price,
        notes: data.notes,
      },
    });
  }

  static async deleteItem(itemId: string, tenantId: string) {
    const item = await prisma.treatmentPlanItem.findFirst({
      where: { id: itemId, treatmentPlan: { tenantId } },
    });

    if (!item) throw new Error("Treatment plan item not found");

    await prisma.treatmentPlanItem.delete({ where: { id: itemId } });
  }

  static async remove(id: string, tenantId: string) {
    const plan = await prisma.treatmentPlan.findFirst({ where: { id, tenantId } });

    if (!plan) throw new Error("Treatment plan not found");

    await prisma.treatmentPlanItem.deleteMany({ where: { treatmentPlanId: id } });
    await prisma.treatmentPlan.delete({ where: { id } });
  }

  static async findByPatient(patientId: string, tenantId: string) {
    return prisma.treatmentPlan.findMany({
      where: { patientId, tenantId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
