// src/utils/buildLink.ts

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

/**
 * Builds a route string with structured query parameters.
 * Designed for use with React Router (and HashRouter).
 * Never hand-write "?x=y" strings.
 *
 * @param path The base path, e.g. "/controls" or "/clients/cases/CASE-2026-031"
 * @param params Key-value pairs for query parameters
 * @returns Formatted path string, e.g. "/controls?tab=library&control=GOV-SOD-001"
 */
export function buildLink(path: string, params?: QueryParams): string {
  // Normalize path to ensure leading slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (!params) {
    return cleanPath;
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `${cleanPath}?${queryString}` : cleanPath;
}

/**
 * Helper to update existing search parameters while preserving unmentioned ones
 * @param currentSearch Current search string from location.search or URLSearchParams
 * @param updates Parameters to add, update, or remove (null/undefined removes)
 * @returns New query string
 */
export function updateQueryParams(
  currentSearch: string | URLSearchParams,
  updates: QueryParams
): string {
  const params = typeof currentSearch === 'string'
    ? new URLSearchParams(currentSearch)
    : new URLSearchParams(currentSearch.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined || value === '') {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  }

  return params.toString();
}
