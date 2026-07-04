import { PrismaClient } from '@prisma/client'

type ExtraDelegate<T> = {
  create: (args: { data: T }) => Promise<T & { id: string; createdAt: Date }>
  upsert: (args: { where: any; create: T; update: Partial<T> }) => Promise<T & { id: string; createdAt: Date }>
  findFirst: (args?: any) => Promise<any>
  findMany: (args?: any) => Promise<any[]>
  findUnique: (args: any) => Promise<any>
  update: (args: any) => Promise<any>
  delete: (args: any) => Promise<any>
}

// Temporary shim: `contactMessage` exists in schema.prisma
// but the Prisma client types may lag until `prisma generate` is re-run (dev server can lock the DLL on Windows).
type ExtendedPrisma = PrismaClient & {
  contactMessage: ExtraDelegate<{ name: string; email: string; subject: string; message: string; isHandled?: boolean }>
}

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrisma | undefined
}

export const db: ExtendedPrisma =
  globalForPrisma.prisma ??
  (new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  }) as ExtendedPrisma)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
