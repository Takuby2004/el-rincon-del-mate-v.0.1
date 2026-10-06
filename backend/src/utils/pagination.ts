/**
 * Utilidades para paginación estandarizada en el servidor.
 */

export interface PaginationQuery {
  page?: string | number;
  pageSize?: string | number;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMetadata;
}

export function parsePaginationParams(query: PaginationQuery, defaultPageSize: number = 20) {
  const hasPageParam = query.page !== undefined;
  const hasPageSizeParam = query.pageSize !== undefined;
  const isPaginated = hasPageParam || hasPageSizeParam;

  const rawPage = parseInt(String(query.page || 1), 10);
  const rawPageSize = parseInt(String(query.pageSize || defaultPageSize), 10);

  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize = Number.isInteger(rawPageSize) && rawPageSize > 0
    ? Math.min(100, rawPageSize) // Límite máximo de seguridad: 100 registros por página
    : defaultPageSize;

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  return { page, pageSize, skip, take, isPaginated };
}

export function buildPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items,
    pagination: {
      total,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
}
