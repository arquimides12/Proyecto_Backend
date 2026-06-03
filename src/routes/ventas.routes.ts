import { Router, Response } from 'express';
import { VentasService } from '../services/ventas.service';
import { verificarToken } from '../middlewares/auth.middleware';
import { AuthRequest } from '../types';
import { Server } from 'socket.io';

const router = Router();
const ventasService = new VentasService();

export default (io: Server) => {

  // Abrir sesión de caja
  router.post('/sesion/abrir', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
      const sesion = await ventasService.abrirSesion(req.socio!.socioId);
      res.status(201).json(sesion);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  });

  // Cerrar sesión de caja
  router.put('/sesion/:id/cerrar', verificarToken, async (req: AuthRequest<{ id: string }>, res: Response) => {
    try {
      const sesion = await ventasService.cerrarSesion(req.params.id, req.socio!.socioId);
      res.json(sesion);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  });

  // Registrar venta
  router.post('/', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
      const venta = await ventasService.registrarVenta(req.body, io);
      res.status(201).json(venta);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  });

  return router;
};