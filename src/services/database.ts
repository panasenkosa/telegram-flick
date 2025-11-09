import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export async function ensureUser(userId: bigint, userData?: {
  username?: string;
  firstName?: string;
  lastName?: string;
}) {
  return prisma.user.upsert({
    where: { id: userId },
    update: {
      username: userData?.username,
      firstName: userData?.firstName,
      lastName: userData?.lastName,
      updatedAt: new Date(),
    },
    create: {
      id: userId,
      username: userData?.username,
      firstName: userData?.firstName,
      lastName: userData?.lastName,
    },
  });
}

export async function getUserSession(userId: bigint) {
  return prisma.userSession.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      state: 'IDLE',
      photosReceived: 0,
    },
  });
}

export async function updateUserSession(userId: bigint, data: {
  state?: 'IDLE' | 'WAITING_FOR_PHOTOS' | 'PROCESSING';
  currentGenerationId?: string | null;
  photosReceived?: number;
  data?: any;
}) {
  return prisma.userSession.update({
    where: { userId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

export async function canUserGenerate(userId: bigint): Promise<{ canGenerate: boolean; reason?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { canGenerate: false, reason: 'User not found' };
  }

  const totalGenerations = user.freeGenerations + user.paidGenerations;
  
  if (totalGenerations > 0) {
    return { canGenerate: true };
  }

  return { 
    canGenerate: false, 
    reason: 'No generations left. Please purchase more using /buy command.' 
  };
}

export async function decrementUserGenerations(userId: bigint) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.freeGenerations > 0) {
    return prisma.user.update({
      where: { id: userId },
      data: { freeGenerations: user.freeGenerations - 1 },
    });
  }

  if (user.paidGenerations > 0) {
    return prisma.user.update({
      where: { id: userId },
      data: { paidGenerations: user.paidGenerations - 1 },
    });
  }

  throw new Error('No generations available');
}

