import { mockDeep, mockReset } from 'jest-mock-extended';
import prisma from '../src/lib/prisma';

jest.mock('../src/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep(),
}));

beforeEach(() => {
  mockReset(prisma);
});

export const prismaMock = prisma;
