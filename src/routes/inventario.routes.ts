import { Router, Response } from 'express';
import { ProductosService } from '../services/productos.service';
import { verificarToken } from '../middlewares/auth.middleware';
import { AuthRequest } from '../types';

const router = Router();
const productosService = new ProductosService();

// Alertas de stock bajo
router.get('/alertas', verificarToken, async (req: AuthRequest, res: Response) => {
  try {
    const alertas = await productosService.alertasStock(req.socio!.negocioId);
    res.json(alertas);
  } catch (error: any) {
    res.status(500).json({ mensaje: error.message });
  }
});

export default router;