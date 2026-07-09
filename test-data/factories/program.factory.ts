import { faker } from '@faker-js/faker';

export type ProgramDraft = {
  name: string;
  description: string;
};

/** Unique happy-path program payload for create/edit flows. */
export function buildProgram(overrides: Partial<ProgramDraft> = {}): ProgramDraft {
  const suffix = `${Date.now()}-${faker.string.alphanumeric(6)}`;
  return {
    name: overrides.name ?? `${faker.commerce.productName()} ${suffix}`,
    description:
      overrides.description ??
      faker.lorem.paragraph({ min: 1, max: 2 }) + ` (${suffix})`,
  };
}
