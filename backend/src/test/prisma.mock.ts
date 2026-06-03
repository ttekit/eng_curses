/**
 * Minimal PrismaService stub for Nest unit tests.
 */
export const prismaMock = {
  user: { findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn() },
  tag: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};
