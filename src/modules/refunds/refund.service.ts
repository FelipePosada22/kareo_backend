import { prisma } from "../../config/prisma";
import { RefundStatus, InvoiceStatus } from "@prisma/client";

export class RefundService {
  static async create(data: any, tenantId: string) {
    const { paymentId, amount, reason, method } = data;

    if (!amount || amount <= 0) {
      throw new Error("Refund amount must be greater than zero");
    }

    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, invoice: { tenantId } },
      include: { invoice: true, refunds: true },
    });

    if (!payment) throw new Error("Payment not found");

    if (payment.invoice.status === InvoiceStatus.CANCELLED) {
      throw new Error("Cannot refund a cancelled invoice");
    }

    const totalRefunded = payment.refunds.reduce((sum, r) => sum + r.amount, 0);
    if (totalRefunded + amount > payment.amount) {
      throw new Error(`Refund amount exceeds available balance. Max refundable: ${payment.amount - totalRefunded}`);
    }

    const refund = await prisma.refund.create({
      data: {
        paymentId,
        invoiceId: payment.invoiceId,
        amount,
        reason: reason ?? null,
        method,
        status: RefundStatus.COMPLETED,
      },
    });

    // Si el total reembolsado cubre el total pagado, revertir la factura a ISSUED
    const newTotalRefunded = totalRefunded + amount;
    if (newTotalRefunded >= payment.amount) {
      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: InvoiceStatus.ISSUED },
      });
    }

    return refund;
  }

  static async findByInvoice(invoiceId: string, tenantId: string) {
    const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, tenantId } });
    if (!invoice) throw new Error("Invoice not found");

    return prisma.refund.findMany({
      where: { invoiceId },
      include: { payment: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
