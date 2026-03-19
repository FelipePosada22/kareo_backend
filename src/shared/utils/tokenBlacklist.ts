import crypto from "crypto";
import { prisma } from "../../config/prisma";

export const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

export const blacklistToken = async (token: string, expiresAt: Date): Promise<void> => {
  const tokenHash = hashToken(token);

  await prisma.tokenBlacklist.upsert({
    where: { tokenHash },
    update: {},
    create: { tokenHash, expiresAt },
  });

  // Limpiar tokens expirados
  await prisma.tokenBlacklist.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const tokenHash = hashToken(token);
  const found = await prisma.tokenBlacklist.findUnique({ where: { tokenHash } });
  return !!found;
};
