import { z } from "zod";

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationParams = {
  page: number;
  pageSize: number;
};

export const toPagination = (params: PaginationParams) => {
  const take = params.pageSize;
  const skip = (params.page - 1) * params.pageSize;
  return { take, skip };
};
