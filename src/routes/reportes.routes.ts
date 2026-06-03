import { Router, Response } from 'express';
import { VentasService } from '../services/ventas.service';
import { verificarToken } from '../middlewares/auth.middleware';
import { AuthRequest } from '../types';

const router = Router();
const ventasService = new VentasService();

// Reporte de ventas del negocio
router.get('/', verificarToken, async (req: AuthRequest, res: Response) => {
  try {
    const ventas = await ventasService.reporteVentas(req.socio!.negocioId);
    res.json(ventas);
  } catch (error: any) {
    res.status(500).json({ mensaje: error.message });
  }
});

export default router;