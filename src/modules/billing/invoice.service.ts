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
}
