import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';

const prisma = new PrismaClient();

export class VentasService {

  async abrirSesion(socioId: string) {
    return prisma.sesionCaja.create({
      data: { socioId, estado: 'ABIERTA' }
    });
  }

  async cerrarSesion(sesionId: string, socioId: string) {
    const ventas = await prisma.venta.aggregate({
      where: { sesionId, estado: 'CONFIRMADA' },
      _sum: { total: true }
    });

    return prisma.sesionCaja.update({
      where: { id: sesionId, socioId },
      data: {
        cierre: new Date(),
        estado: 'CERRADA',
        totalSesion: ventas._sum.total ?? 0
      }
    });
  }

  async registrarVenta(data: {
    sesionId: string;
    detalles: { productoId: string; cantidad: number; precioUnit: number }[];
  }, io: Server) {

    return await prisma.$transaction(async (tx) => {

      // Verifica stock de todos los productos antes de vender
      for (const item of data.detalles) {
        const producto = await tx.producto.findUnique({
          where: { id: item.productoId }
        });

        if (!producto || producto.stock < item.cantidad) {
          throw new Error(`Stock insuficiente para: ${producto?.nombre ?? item.productoId}`);
        }
      }

      const total = data.detalles.reduce(
        (sum, i) => sum + i.precioUnit * i.cantidad, 0
      );

      const venta = await tx.venta.create({
        data: {
          sesionId: data.sesionId,
          total,
          detalles: {
            create: data.detalles.map(i => ({
              productoId: i.productoId,
              cantidad: i.cantidad,
              precioUnit: i.precioUnit
            }))
          }
        },
        include: { detalles: true }
      });

      // Descuenta stock y emite evento WebSocket
      for (const item of data.detalles) {
        const actualizado = await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: { decrement: item.cantidad } }
        });

        io.emit('stock:actualizado', {
          productoId: item.productoId,
          nuevoStock: actualizado.stock
        });
      }

      return venta;
    });
  }

  async reporteVentas(negocioId: string) {
    return prisma.venta.findMany({
      where: {
        sesion: { socio: { negocioId } },
        estado: 'CONFIRMADA'
      },
      include: {
        detalles: { include: { producto: true } },
        sesion: { include: { socio: true } }
      },
      orderBy: { creadoEn: 'desc' },
      take: 50
    });
  }
}