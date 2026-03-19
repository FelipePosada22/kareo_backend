import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma";

export class UserService {
  static async create(data: any, tenantId: string) {
    const { name, email, password, role } = data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("Email already in use");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { tenantId, name, email, password: hashedPassword, role },
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async findAll(tenantId: string) {
    const users = await prisma.user.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });

    return users.map(({ password, ...u }) => u);
  }

  static async findById(id: string, tenantId: string) {
    const user = await prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async update(id: string, data: any, tenantId: string) {
    const user = await prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new Error("User not found");

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const updated = await prisma.user.update({ where: { id }, data });
    const { password, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  static async remove(id: string, tenantId: string, requestingUserId: string) {
    if (id === requestingUserId) throw new Error("Cannot delete your own account");

    const user = await prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new Error("User not found");

    await prisma.user.delete({ where: { id } });
  }
}
