import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma";
import { generateToken, JWT_SECRET } from "../../shared/utils/jwt";
import { blacklistToken } from "../../shared/utils/tokenBlacklist";

export class AuthService {
  static async register(data: any) {
    const { clinicName, slug, name, email, password } = data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx: any) => {
      const tenant = await tx.tenant.create({
        data: {
          name: clinicName,
          slug,
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name,
          email,
          password: hashedPassword,
          role: "ADMIN",
        },
      });

      return { tenant, user };
    });

    const token = generateToken({
      userId: result.user.id,
      tenantId: result.tenant.id,
    });

    return {
      token,
      user: result.user,
    };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new Error("Invalid credentials");

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) throw new Error("Invalid credentials");

    const token = generateToken({
      userId: user.id,
      tenantId: user.tenantId,
    });

    return {
      token,
      user,
    };
  }

  static async logout(token: string): Promise<void> {
    const decoded = jwt.decode(token) as { exp?: number } | null;

    if (!decoded || !decoded.exp) {
      throw new Error("Invalid token");
    }

    const expiresAt = new Date(decoded.exp * 1000);
    await blacklistToken(token, expiresAt);
  }
}