import type { Page, Response } from '@playwright/test';

export function extractProgramId(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') {
    return undefined;
  }

  const record = body as Record<string, unknown>;
  if (typeof record.id === 'string') {
    return record.id;
  }

  const data = record.data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const nestedId = (data as Record<string, unknown>).id;
    if (typeof nestedId === 'string') {
      return nestedId;
    }
  }

  if (Array.isArray(data) && data[0] && typeof data[0] === 'object') {
    const firstId = (data[0] as Record<string, unknown>).id;
    if (typeof firstId === 'string') {
      return firstId;
    }
  }

  return undefined;
}

export function waitForProgramCreateResponse(page: Page) {
  return page.waitForResponse(
    (res) => res.url().includes('/api/programs') && res.request().method() === 'POST',
    { timeout: 30_000 },
  );
}

export async function programIdFromCreateResponse(response: Response): Promise<string | undefined> {
  if (!response.ok()) {
    return undefined;
  }
  try {
    return extractProgramId(await response.json());
  } catch {
    return undefined;
  }
}
