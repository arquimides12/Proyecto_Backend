import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProductosService {

  async crear(data: {
    socioId: string;
    nombre: string;
    valor: number;
    stock: number;
    imagenUrl?: string;
    descripcion?: string;
  }) {
    const producto = await prisma.producto.create({ data });

    if (data.stock > 0) {
      await prisma.alerta.create({
        data: { productoId: producto.id, stockMinimo: 5 }
      });
    }
    return producto;
  }

  async listarPorNegocio(negocioId: string) {
    return prisma.producto.findMany({
      where: { socio: { negocioId }, activo: true },
      include: { socio: { select: { nombre: true } } },
      orderBy: { creadoEn: 'desc' }
    });
  }

  async listarPropios(socioId: string) {
    return prisma.producto.findMany({
      where: { socioId, activo: true },
      orderBy: { creadoEn: 'desc' }
    });
  }

  async actualizar(id: string, socioId: string, data: {
    nombre?: string;
    valor?: number;
    stock?: number;
    imagenUrl?: string;
    descripcion?: string;
  }) {
    return prisma.producto.update({
      where: { id, socioId },
      data
    });
  }

  async eliminar(id: string, socioId: string) {
    return prisma.producto.update({
      where: { id, socioId },
      data: { activo: false }
    });
  }

  async alertasStock(negocioId: string) {
    return prisma.alerta.findMany({
      where: {
        activa: true,
        producto: {
          socio: { negocioId },
          activo: true
        }
      },
      include: {
        producto: { select: { nombre: true, stock: true } }
      }
    });
  }
}