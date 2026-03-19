import { prisma } from "../../config/prisma";
import { InvoiceStatus } from "@prisma/client";

export class InvoiceService {
  static async create(data: any, tenantId: string) {
    const { patientId, appointmentId, dueDate, notes, items } = data;

    if (!items || items.length === 0) {
      throw new Error("Invoice must have at least one item");
    }

    if (appointmentId) {
      const existing = await prisma.invoice.findUnique({
        where: { appointmentId },
      });
      if (existing) {
        throw new Error("This appointment already has an invoice");
      }
    }

    const itemsWithTotal = items.map((item: any) => ({
      description: item.description,
      quantity: item.quantity ?? 1,
      unitPrice: item.unitPrice,
      total: (item.quantity ?? 1) * item.unitPrice,
    }));

    return prisma.invoice.create({
      data: {
        tenantId,
        patientId,
        appointmentId: appointmentId ?? null,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes ?? null,
        items: {
          create: itemsWithTotal,
        },
      },
      include: {
        patient: true,
        appointment: true,
        items: true,
        payments: true,
      },
    });
  }

  static async findAll(tenantId: string) {
    return prisma.invoice.findMany({
      where: { tenantId },
      include: {
        patient: { select: { id: true, name: true } },
        items: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findById(id: string, tenantId: string) {
    return prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        patient: true,
        appointment: {
          include: {
            professional: { select: { id: true, name: true } },
            appointmentType: { select: { id: true, name: true } },
          },
        },
        items: true,
        payments: true,
      },
    });
  }

  static async updateStatus(id: string, status: InvoiceStatus, tenantId: string) {
    const invoice = await prisma.invoice.findFirst({ where: { id, tenantId } });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    const issuedAt = status === InvoiceStatus.ISSUED && !invoice.issuedAt
      ? new Date()
      : invoice.issuedAt;

    return prisma.invoice.update({
      where: { id },
      data: { status, issuedAt },
    });
  }

  static async addPayment(invoiceId: string, data: any, tenantId: string) {
    if (!data.amount || data.amount <= 0) {
      throw new Error("Payment amount must be greater than zero");
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      include: { items: true, payments: true },
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new Error("Cannot add payment to a cancelled invoice");
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error("This invoice is already paid");
    }

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount: data.amount,
        method: data.method,
        reference: data.reference ?? null,
      },
    });

    const totalInvoice = invoice.items.reduce((sum, item) => sum + item.total, 0);
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + data.amount;

    if (totalPaid >= totalInvoice) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: InvoiceStatus.PAID },
      });
    }

    return payment;
  }

  static async createFromTreatmentPlan(treatmentPlanId: string, data: any, tenantId: string) {
    const plan = await prisma.treatmentPlan.findFirst({
      where: { id: treatmentPlanId, tenantId },
      include: { items: { include: { invoiceItems: true } } },
    });

    if (!plan) throw new Error("Treatment plan not found");

    // Items no cancelados
    let candidateItems = plan.items.filter((item) => item.status !== "CANCELLED");

    // Si se pasan itemIds específicos, filtrar solo esos
    if (data?.itemIds && Array.isArray(data.itemIds) && data.itemIds.length > 0) {
      const validIds = new Set(plan.items.map((i) => i.id));
      const invalidIds = (data.itemIds as string[]).filter((id) => !validIds.has(id));
      if (invalidIds.length > 0) {
        throw new Error(`Items not found in this plan: ${invalidIds.join(", ")}`);
      }
      candidateItems = candidateItems.filter((item) => (data.itemIds as string[]).includes(item.id));
    }

    if (candidateItems.length === 0) throw new Error("No valid items to invoice");

    // Verificar que ningún item ya esté facturado (evitar doble facturación)
    const alreadyInvoiced = candidateItems.filter((item) => item.invoiceItems.length > 0);
    if (alreadyInvoiced.length > 0) {
      throw new Error(
        `These items are already invoiced: ${alreadyInvoiced.map((i) => i.description).join(", ")}`
      );
    }

    return prisma.invoice.create({
      data: {
        tenantId,
        patientId: plan.patientId,
        treatmentPlanId,
        dueDate: data?.dueDate ? new Date(data.dueDate) : null,
        notes: data?.notes ?? null,
        status: InvoiceStatus.ISSUED,
        issuedAt: new Date(),
        items: {
          create: candidateItems.map((item) => ({
            treatmentPlanItemId: item.id,
            description: item.description,
            quantity: 1,
            unitPrice: item.price,
            total: item.price,
          })),
        },
      },
      include: {
        patient: true,
        treatmentPlan: { include: { items: true } },
        items: true,
        payments: true,
        refunds: true,
      },
    });
  }

  static async updateDraft(id: string, data: any, tenantId: string) {
    const invoice = await prisma.invoice.findFirst({ where: { id, tenantId } });
    if (!invoice) throw new Error("Invoice not found");
    if (invoice.status !== "DRAFT") throw new Error("Only DRAFT invoices can be edited");

    return prisma.invoice.update({
      where: { id },
      data: {
        notes: data.notes !== undefined ? data.notes : invoice.notes,
        dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : invoice.dueDate,
      },
      include: { items: true, payments: true },
    });
  }

  static async addItem(invoiceId: string, data: any, tenantId: string) {
    const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, tenantId } });
    if (!invoice) throw new Error("Invoice not found");
    if (invoice.status !== "DRAFT") throw new Error("Only DRAFT invoices can be edited");

    if (!data.description || !data.unitPrice || data.unitPrice <= 0) {
      throw new Error("description and unitPrice (> 0) are required");
    }

    const quantity = data.quantity ?? 1;
    return prisma.invoiceItem.create({
      data: {
        invoiceId,
        description: data.description,
        quantity,
        unitPrice: data.unitPrice,
        total: quantity * data.unitPrice,
      },
    });
  }

  static async updateItem(invoiceId: string, itemId: string, data: any, tenantId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      include: { items: true },
    });
    if (!invoice) throw new Error("Invoice not found");
    if (invoice.status !== "DRAFT") throw new Error("Only DRAFT invoices can be edited");

    const item = invoice.items.find((i) => i.id === itemId);
    if (!item) throw new Error("Item not found in this invoice");

    const quantity = data.quantity ?? item.quantity;
    const unitPrice = data.unitPrice ?? item.unitPrice;

    if (unitPrice <= 0) throw new Error("unitPrice must be greater than zero");

    return prisma.invoiceItem.update({
      where: { id: itemId },
      data: {
        description: data.description ?? item.description,
        quantity,
        unitPrice,
        total: quantity * unitPrice,
      },
    });
  }

  static async removeItem(invoiceId: string, itemId: string, tenantId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      include: { items: true },
    });
    if (!invoice) throw new Error("Invoice not found");
    if (invoice.status !== "DRAFT") throw new Error("Only DRAFT invoices can be edited");
    if (invoice.items.length <= 1) throw new Error("Invoice must have at least one item");

    const item = invoice.items.find((i) => i.id === itemId);
    if (!item) throw new Error("Item not found in this invoice");

    await prisma.invoiceItem.delete({ where: { id: itemId } });
  }

  static async getSummary(invoiceId: string, tenantId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      include: { items: true, payments: true, refunds: true },
    });

    if (!invoice) throw new Error("Invoice not found");

    const total = invoice.items.reduce((sum, item) => sum + item.total, 0);
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const totalRefunded = invoice.refunds.reduce((sum, r) => sum + r.amount, 0);
    const balance = total - totalPaid + totalRefunded;

    return {
      total,
      totalPaid,
      totalRefunded,
      balance,
      isPaid: balance <= 0,
    };
  }
}
