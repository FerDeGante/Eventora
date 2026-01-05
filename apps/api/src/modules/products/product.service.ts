import { prisma } from '../../lib/prisma';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateProductInput,
  UpdateProductInput,
  ProductQuery,
  CreateStockMovementInput,
  StockMovementQuery,
  CreateSaleInput,
  CompleteSaleInput,
  SaleQuery,
} from './product.schema';

// ============================================
// PRODUCT CATEGORIES
// ============================================

export async function listCategories(clinicId: string) {
  return prisma.productCategory.findMany({
    where: { clinicId },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: {
      _count: { select: { products: true } },
    },
  });
}

export async function createCategory(clinicId: string, input: CreateCategoryInput) {
  return prisma.productCategory.create({
    data: { clinicId, ...input },
  });
}

export async function updateCategory(clinicId: string, id: string, input: UpdateCategoryInput) {
  const existing = await prisma.productCategory.findFirst({ where: { id, clinicId } });
  if (!existing) return null;
  return prisma.productCategory.update({ where: { id }, data: input });
}

export async function deleteCategory(clinicId: string, id: string) {
  const existing = await prisma.productCategory.findFirst({ where: { id, clinicId } });
  if (!existing) return null;
  
  // Desasociar productos de la categoría
  await prisma.product.updateMany({
    where: { clinicId, categoryId: id },
    data: { categoryId: null },
  });
  
  return prisma.productCategory.delete({ where: { id } });
}

// ============================================
// PRODUCTS
// ============================================

export async function listProducts(clinicId: string, query: ProductQuery) {
  const { categoryId, isActive, lowStock, search, limit, offset } = query;

  const where: any = { clinicId };
  
  if (categoryId) where.categoryId = categoryId;
  if (isActive !== undefined) where.isActive = isActive;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { barcode: { contains: search, mode: 'insensitive' } },
    ];
  }

  let products = await prisma.product.findMany({
    where,
    include: {
      category: { select: { id: true, name: true } },
    },
    orderBy: [{ name: 'asc' }],
    take: limit,
    skip: offset,
  });

  // Filtrar productos con stock bajo si se solicita
  if (lowStock) {
    products = products.filter((p) => p.trackStock && p.stockQty <= p.lowStockAt);
  }

  const total = await prisma.product.count({ where });

  return { products, total, limit, offset };
}

export async function getProductById(clinicId: string, id: string) {
  return prisma.product.findFirst({
    where: { id, clinicId },
    include: {
      category: { select: { id: true, name: true } },
      stockMovements: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
}

export async function createProduct(clinicId: string, input: CreateProductInput) {
  return prisma.product.create({
    data: { clinicId, ...input },
  });
}

export async function updateProduct(clinicId: string, id: string, input: UpdateProductInput) {
  const existing = await prisma.product.findFirst({ where: { id, clinicId } });
  if (!existing) return null;
  return prisma.product.update({ where: { id }, data: input });
}

export async function deleteProduct(clinicId: string, id: string) {
  const existing = await prisma.product.findFirst({ where: { id, clinicId } });
  if (!existing) return null;
  return prisma.product.delete({ where: { id } });
}

// ============================================
// STOCK MOVEMENTS
// ============================================

export async function listStockMovements(clinicId: string, query: StockMovementQuery) {
  const { productId, type, startDate, endDate, limit, offset } = query;

  const where: any = { clinicId };
  if (productId) where.productId = productId;
  if (type) where.type = type;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, sku: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return { movements, total, limit, offset };
}

export async function createStockMovement(
  clinicId: string, 
  input: CreateStockMovementInput,
  createdById?: string
) {
  const product = await prisma.product.findFirst({
    where: { id: input.productId, clinicId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  const previousQty = product.stockQty;
  const newQty = previousQty + input.quantity;

  if (newQty < 0) {
    throw new Error(`Insufficient stock. Available: ${previousQty}`);
  }

  // Crear movimiento y actualizar stock en transacción
  const [movement] = await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        clinicId,
        productId: input.productId,
        type: input.type,
        quantity: input.quantity,
        previousQty,
        newQty,
        reference: input.reference,
        notes: input.notes,
        createdById,
      },
    }),
    prisma.product.update({
      where: { id: input.productId },
      data: { stockQty: newQty },
    }),
  ]);

  return movement;
}

// ============================================
// SALES
// ============================================

export async function listSales(clinicId: string, query: SaleQuery) {
  const { userId, status, branchId, startDate, endDate, limit, offset } = query;

  const where: any = { clinicId };
  if (userId) where.userId = userId;
  if (status) where.status = status;
  if (branchId) where.branchId = branchId;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.sale.count({ where }),
  ]);

  return { sales, total, limit, offset };
}

export async function getSaleById(clinicId: string, id: string) {
  return prisma.sale.findFirst({
    where: { id, clinicId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, sku: true } },
        },
      },
    },
  });
}

export async function createSale(
  clinicId: string, 
  input: CreateSaleInput,
  createdById?: string
) {
  // Calcular totales
  const itemsWithTotals = input.items.map((item) => ({
    ...item,
    total: item.unitPrice * item.quantity - item.discount,
  }));

  const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal - input.discount;

  // Crear venta
  const sale = await prisma.sale.create({
    data: {
      clinicId,
      userId: input.userId,
      branchId: input.branchId,
      subtotal,
      discount: input.discount,
      total,
      status: 'PENDING',
      createdById,
      notes: input.notes,
      metadata: input.metadata,
      items: {
        create: itemsWithTotals,
      },
    },
    include: {
      items: true,
    },
  });

  return sale;
}

export async function completeSale(
  clinicId: string, 
  id: string, 
  input: CompleteSaleInput,
  createdById?: string
) {
  const sale = await prisma.sale.findFirst({
    where: { id, clinicId },
    include: { items: true },
  });

  if (!sale) {
    throw new Error('Sale not found');
  }

  if (sale.status !== 'PENDING') {
    throw new Error(`Sale is already ${sale.status.toLowerCase()}`);
  }

  // Actualizar stock para productos
  for (const item of sale.items) {
    if (item.productId) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (product && product.trackStock) {
        await createStockMovement(
          clinicId,
          {
            productId: item.productId,
            type: 'SALE',
            quantity: -item.quantity,
            reference: sale.id,
            notes: `Sale #${sale.id}`,
          },
          createdById
        );
      }
    }
  }

  // Marcar como completada
  return prisma.sale.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      paymentProvider: input.paymentProvider,
      paymentRef: input.paymentRef,
    },
    include: { items: true },
  });
}

export async function refundSale(clinicId: string, id: string) {
  const sale = await prisma.sale.findFirst({
    where: { id, clinicId },
    include: { items: true },
  });

  if (!sale) {
    throw new Error('Sale not found');
  }

  if (sale.status !== 'COMPLETED') {
    throw new Error('Only completed sales can be refunded');
  }

  // Revertir stock
  for (const item of sale.items) {
    if (item.productId) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (product && product.trackStock) {
        await createStockMovement(
          clinicId,
          {
            productId: item.productId,
            type: 'RETURN',
            quantity: item.quantity, // Positivo = regresa al stock
            reference: sale.id,
            notes: `Refund for Sale #${sale.id}`,
          }
        );
      }
    }
  }

  return prisma.sale.update({
    where: { id },
    data: { status: 'REFUNDED' },
  });
}

export async function cancelSale(clinicId: string, id: string) {
  const sale = await prisma.sale.findFirst({
    where: { id, clinicId },
  });

  if (!sale) {
    throw new Error('Sale not found');
  }

  if (sale.status !== 'PENDING') {
    throw new Error('Only pending sales can be cancelled');
  }

  return prisma.sale.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });
}
