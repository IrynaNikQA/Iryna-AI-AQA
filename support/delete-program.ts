function apiBaseUrl(): string {
  const url = process.env.DIDAXIS_URL?.replace(/\/$/, '');
  if (!url) {
    throw new Error('DIDAXIS_URL must be set (e.g. in .env)');
  }
  return url;
}

function apiToken(): string {
  const token = process.env.DIDAXIS_API_TOKEN;
  if (!token) {
    throw new Error('DIDAXIS_API_TOKEN must be set (e.g. in .env)');
  }
  return token;
}

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${apiToken()}`,
    Accept: 'application/json',
  };
}

/** DELETE /api/programs/<uuid> — ignores 404 (already removed). */
export async function deleteProgram(programId: string): Promise<void> {
  const res = await fetch(`${apiBaseUrl()}/api/programs/${programId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (res.status === 404) {
    return;
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`DELETE /api/programs/${programId} failed: ${res.status} ${body}`);
  }
}

export type ProgramListItem = { id: string; name: string };

/** GET /api/programs — returns id/name pairs from `data[]`. */
export async function listPrograms(): Promise<ProgramListItem[]> {
  const res = await fetch(`${apiBaseUrl()}/api/programs`, {
    method: 'GET',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GET /api/programs failed: ${res.status} ${body}`);
  }

  const json = (await res.json()) as { data?: Array<{ id?: string; name?: string }> };
  const rows = json.data ?? [];
  return rows
    .filter((row): row is { id: string; name: string } => typeof row.id === 'string')
    .map((row) => ({ id: row.id, name: row.name ?? '' }));
}
