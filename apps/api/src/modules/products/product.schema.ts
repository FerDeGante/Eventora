import { z } from 'zod';
import { StockMovementType, SaleStatus, SaleItemType } from '@prisma/client';

// ============================================
// PRODUCT CATEGORY SCHEMAS
// ============================================

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  sortOrder: z.number().int().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

// ============================================
// PRODUCT SCHEMAS
// ============================================

export const createProductSchema = z.object({
  categoryId: z.string().cuid().optional(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  price: z.number().int().min(0).default(0),
  cost: z.number().int().min(0).default(0),
  trackStock: z.boolean().default(true),
  stockQty: z.number().int().default(0),
  lowStockAt: z.number().int().min(0).default(5),
  isActive: z.boolean().default(true),
  imageUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  categoryId: z.string().cuid().optional(),
  isActive: z.coerce.boolean().optional(),
  lowStock: z.coerce.boolean().optional(), // Filtrar productos con stock bajo
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// ============================================
// STOCK MOVEMENT SCHEMAS
// ============================================

export const stockMovementTypeEnum = z.nativeEnum(StockMovementType);

export const createStockMovementSchema = z.object({
  productId: z.string().cuid(),
  type: stockMovementTypeEnum,
  quantity: z.number().int(), // positivo = entrada, negativo = salida
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const stockMovementQuerySchema = z.object({
  productId: z.string().cuid().optional(),
  type: stockMovementTypeEnum.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// ============================================
// SALE SCHEMAS
// ============================================

export const saleStatusEnum = z.nativeEnum(SaleStatus);
export const saleItemTypeEnum = z.nativeEnum(SaleItemType);

export const saleItemSchema = z.object({
  type: saleItemTypeEnum,
  productId: z.string().cuid().optional(),
  referenceId: z.string().optional(),
  name: z.string(),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.number().int().min(0),
  discount: z.number().int().min(0).default(0),
});

export const createSaleSchema = z.object({
  userId: z.string().cuid().optional(), // Cliente (opcional para ventas mostrador)
  branchId: z.string().cuid().optional(),
  items: z.array(saleItemSchema).min(1),
  discount: z.number().int().min(0).default(0), // Descuento global
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const completeSaleSchema = z.object({
  paymentProvider: z.enum(['STRIPE', 'CASH', 'POS', 'MERCADO_PAGO']).default('CASH'),
  paymentRef: z.string().optional(),
});

export const saleQuerySchema = z.object({
  userId: z.string().cuid().optional(),
  status: saleStatusEnum.optional(),
  branchId: z.string().cuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// Type exports
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>;
export type StockMovementQuery = z.infer<typeof stockMovementQuerySchema>;
export type SaleItemInput = z.infer<typeof saleItemSchema>;
export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type CompleteSaleInput = z.infer<typeof completeSaleSchema>;
export type SaleQuery = z.infer<typeof saleQuerySchema>;
