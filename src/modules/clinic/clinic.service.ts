import { prisma } from "../../config/prisma";

export class ClinicService {
  static async findByTenant(tenantId: string) {
    return prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        phone: true,
        email: true,
        address: true,
        timezone: true,
        currency: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async update(tenantId: string, data: any) {
    const { name, phone, email, address, timezone, currency } = data;

    return prisma.tenant.update({
      where: { id: tenantId },
      data: { name, phone, email, address, timezone, currency },
      select: {
        id: true,
        name: true,
        slug: true,
        phone: true,
        email: true,
        address: true,
        timezone: true,
        currency: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
