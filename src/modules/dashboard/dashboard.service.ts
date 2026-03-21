import { prisma } from "../../config/prisma";
import { AppointmentStatus, InvoiceStatus } from "@prisma/client";

export class DashboardService {
  static async getSummary(tenantId: string, startDate: Date, endDate: Date) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [
      newPatientsThisMonth,
      totalPatients,
      appointmentsToday,
      appointmentsInPeriod,
      revenueToday,
      revenueInPeriod,
      refundsToday,
      refundsInPeriod,
      pendingInvoices,
      appointmentsByStatus,
      topProfessionals,
      appointmentsByDay,
    ] = await Promise.all([
      // Pacientes nuevos este mes
      prisma.patient.count({
        where: {
          tenantId,
          createdAt: { gte: monthStart },
        },
      }),

      // Total pacientes
      prisma.patient.count({
        where: { tenantId },
      }),

      // Citas de hoy con detalle
      prisma.appointment.findMany({
        where: {
          tenantId,
          startTime: { gte: todayStart, lte: todayEnd },
        },
        include: {
          patient: { select: { id: true, name: true } },
          professional: { select: { id: true, name: true } },
          appointmentType: { select: { id: true, name: true } },
        },
        orderBy: { startTime: "asc" },
      }),

      // Citas en el periodo
      prisma.appointment.findMany({
        where: {
          tenantId,
          startTime: { gte: startDate, lte: endDate },
        },
        select: { status: true, startTime: true },
      }),

      // Ingresos de hoy (pagos realizados hoy, excluye facturas canceladas)
      prisma.payment.findMany({
        where: {
          paidAt: { gte: todayStart, lte: todayEnd },
          invoice: { tenantId, status: { not: InvoiceStatus.CANCELLED } },
        },
        select: { amount: true },
      }),

      // Ingresos en el periodo (excluye facturas canceladas)
      prisma.payment.findMany({
        where: {
          paidAt: { gte: startDate, lte: endDate },
          invoice: { tenantId, status: { not: InvoiceStatus.CANCELLED } },
        },
        select: { amount: true },
      }),

      // Refunds de hoy (solo de facturas no canceladas)
      prisma.refund.findMany({
        where: {
          createdAt: { gte: todayStart, lte: todayEnd },
          invoice: { tenantId, status: { not: InvoiceStatus.CANCELLED } },
        },
        select: { amount: true },
      }),

      // Refunds en el periodo (solo de facturas no canceladas)
      prisma.refund.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          invoice: { tenantId, status: { not: InvoiceStatus.CANCELLED } },
        },
        select: { amount: true },
      }),

      // Facturas pendientes de cobro
      prisma.invoice.findMany({
        where: {
          tenantId,
          status: { in: [InvoiceStatus.ISSUED, InvoiceStatus.OVERDUE] },
        },
        include: {
          items: true,
          patient: { select: { id: true, name: true } },
        },
      }),

      // Distribución de citas por status en el periodo
      prisma.appointment.groupBy({
        by: ["status"],
        where: {
          tenantId,
          startTime: { gte: startDate, lte: endDate },
        },
        _count: { status: true },
      }),

      // Top profesionales por citas atendidas en el periodo
      prisma.appointment.groupBy({
        by: ["professionalId"],
        where: {
          tenantId,
          status: AppointmentStatus.COMPLETED,
          startTime: { gte: startDate, lte: endDate },
        },
        _count: { professionalId: true },
        orderBy: { _count: { professionalId: "desc" } },
        take: 5,
      }),

      // Citas completadas por día en el periodo
      prisma.appointment.findMany({
        where: {
          tenantId,
          status: AppointmentStatus.COMPLETED,
          startTime: { gte: startDate, lte: endDate },
        },
        select: { startTime: true },
      }),
    ]);

    // Enriquecer top profesionales con nombre
    const professionalIds = topProfessionals.map((p) => p.professionalId);
    const professionals = await prisma.professional.findMany({
      where: { id: { in: professionalIds } },
      select: { id: true, name: true, specialty: true },
    });

    const topProfessionalsEnriched = topProfessionals.map((p) => ({
      professional: professionals.find((prof) => prof.id === p.professionalId),
      appointmentsCompleted: p._count.professionalId,
    }));

    // Calcular ingresos (pagos - refunds)
    const totalRevenueToday =
      revenueToday.reduce((sum, p) => sum + p.amount, 0) -
      refundsToday.reduce((sum, r) => sum + r.amount, 0);
    const totalRevenueInPeriod =
      revenueInPeriod.reduce((sum, p) => sum + p.amount, 0) -
      refundsInPeriod.reduce((sum, r) => sum + r.amount, 0);

    // Calcular monto pendiente de facturas
    const pendingAmount = pendingInvoices.reduce(
      (sum, inv) => sum + inv.items.reduce((s, item) => s + item.total, 0),
      0
    );

    // Distribución por status
    const statusMap: Record<string, number> = {};
    appointmentsByStatus.forEach((a) => {
      statusMap[a.status] = a._count.status;
    });

    // Citas por día (agrupar manualmente)
    const byDayMap: Record<string, number> = {};
    appointmentsByDay.forEach((a) => {
      const day = a.startTime.toISOString().slice(0, 10);
      byDayMap[day] = (byDayMap[day] ?? 0) + 1;
    });
    const appointmentsPerDay = Object.entries(byDayMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      period: {
        startDate: startDate.toISOString().slice(0, 10),
        endDate: endDate.toISOString().slice(0, 10),
      },
      patients: {
        total: totalPatients,
        newThisMonth: newPatientsThisMonth,
        attendedInPeriod: statusMap[AppointmentStatus.COMPLETED] ?? 0,
      },
      appointments: {
        today: {
          total: appointmentsToday.length,
          completed: appointmentsToday.filter((a) => a.status === AppointmentStatus.COMPLETED).length,
          scheduled: appointmentsToday.filter((a) => a.status === AppointmentStatus.SCHEDULED).length,
          confirmed: appointmentsToday.filter((a) => a.status === AppointmentStatus.CONFIRMED).length,
          cancelled: appointmentsToday.filter((a) => a.status === AppointmentStatus.CANCELLED).length,
          noShow: appointmentsToday.filter((a) => a.status === AppointmentStatus.NO_SHOW).length,
          list: appointmentsToday,
        },
        inPeriod: {
          total: appointmentsInPeriod.length,
          byStatus: statusMap,
          byDay: appointmentsPerDay,
        },
      },
      revenue: {
        today: totalRevenueToday,
        inPeriod: totalRevenueInPeriod,
        pendingInvoicesCount: pendingInvoices.length,
        pendingAmount,
        pendingInvoices: pendingInvoices.map((inv) => ({
          id: inv.id,
          status: inv.status,
          patient: inv.patient,
          total: inv.items.reduce((s, item) => s + item.total, 0),
        })),
      },
      topProfessionals: topProfessionalsEnriched,
    };
  }
}
