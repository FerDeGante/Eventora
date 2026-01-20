import { FastifyPluginAsync } from 'fastify';
import * as productService from './product.service';
import {
  createCategorySchema,
  updateCategorySchema,
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  createStockMovementSchema,
  stockMovementQuerySchema,
  createSaleSchema,
  completeSaleSchema,
  saleQuerySchema,
} from './product.schema';

const productRoutes: FastifyPluginAsync = async (fastify) => {
  // ============================================
  // CATEGORIES
  // ============================================

  fastify.get('/categories', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const categories = await productService.listCategories(clinicId);
    return reply.send({ categories });
  });

  fastify.post('/categories', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const input = createCategorySchema.parse(request.body);
    const category = await productService.createCategory(clinicId, input);
    return reply.status(201).send(category);
  });

  fastify.patch<{ Params: { id: string } }>('/categories/:id', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const input = updateCategorySchema.parse(request.body);
    const category = await productService.updateCategory(clinicId, request.params.id, input);
    if (!category) {
      return reply.status(404).send({ error: 'Category not found' });
    }
    return reply.send(category);
  });

  fastify.delete<{ Params: { id: string } }>('/categories/:id', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const category = await productService.deleteCategory(clinicId, request.params.id);
    if (!category) {
      return reply.status(404).send({ error: 'Category not found' });
    }
    return reply.status(204).send();
  });

  // ============================================
  // PRODUCTS
  // ============================================

  fastify.get('/', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const query = productQuerySchema.parse(request.query);
    const result = await productService.listProducts(clinicId, query);
    return reply.send(result);
  });

  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const product = await productService.getProductById(clinicId, request.params.id);
    if (!product) {
      return reply.status(404).send({ error: 'Product not found' });
    }
    return reply.send(product);
  });

  fastify.post('/', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const input = createProductSchema.parse(request.body);
    const product = await productService.createProduct(clinicId, input);
    return reply.status(201).send(product);
  });

  fastify.patch<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const input = updateProductSchema.parse(request.body);
    const product = await productService.updateProduct(clinicId, request.params.id, input);
    if (!product) {
      return reply.status(404).send({ error: 'Product not found' });
    }
    return reply.send(product);
  });

  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const product = await productService.deleteProduct(clinicId, request.params.id);
    if (!product) {
      return reply.status(404).send({ error: 'Product not found' });
    }
    return reply.status(204).send();
  });

  // ============================================
  // STOCK MOVEMENTS
  // ============================================

  fastify.get('/stock-movements', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const query = stockMovementQuerySchema.parse(request.query);
    const result = await productService.listStockMovements(clinicId, query);
    return reply.send(result);
  });

  fastify.post('/stock-movements', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const userId = (request as any).userId;
    const input = createStockMovementSchema.parse(request.body);
    try {
      const movement = await productService.createStockMovement(clinicId, input, userId);
      return reply.status(201).send(movement);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // ============================================
  // SALES
  // ============================================

  fastify.get('/sales', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const query = saleQuerySchema.parse(request.query);
    const result = await productService.listSales(clinicId, query);
    return reply.send(result);
  });

  fastify.get<{ Params: { id: string } }>('/sales/:id', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const sale = await productService.getSaleById(clinicId, request.params.id);
    if (!sale) {
      return reply.status(404).send({ error: 'Sale not found' });
    }
    return reply.send(sale);
  });

  fastify.post('/sales', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const userId = (request as any).userId;
    const input = createSaleSchema.parse(request.body);
    const sale = await productService.createSale(clinicId, input, userId);
    return reply.status(201).send(sale);
  });

  fastify.post<{ Params: { id: string } }>('/sales/:id/complete', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const userId = (request as any).userId;
    const input = completeSaleSchema.parse(request.body);
    try {
      const sale = await productService.completeSale(clinicId, request.params.id, input, userId);
      return reply.send(sale);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  fastify.post<{ Params: { id: string } }>('/sales/:id/refund', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    try {
      const sale = await productService.refundSale(clinicId, request.params.id);
      return reply.send(sale);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  fastify.post<{ Params: { id: string } }>('/sales/:id/cancel', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    try {
      const sale = await productService.cancelSale(clinicId, request.params.id);
      return reply.send(sale);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });
};

export default productRoutes;
