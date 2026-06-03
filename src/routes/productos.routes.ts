import { Router, Response } from 'express';
import { ProductosService } from '../services/productos.service';
import { verificarToken } from '../middlewares/auth.middleware';
import { AuthRequest } from '../types';

const router = Router();
const productosService = new ProductosService();

// Crear producto
router.post('/', verificarToken, async (req: AuthRequest, res: Response) => {
  try {
    const producto = await productosService.crear({
      ...req.body,
      socioId: req.socio!.socioId
    });
    res.status(201).json(producto);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message });
  }
});

// Ver todos los productos del negocio (para no duplicar)
router.get('/negocio', verificarToken, async (req: AuthRequest, res: Response) => {
  try {
    const productos = await productosService.listarPorNegocio(req.socio!.negocioId);
    res.json(productos);
  } catch (error: any) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Ver solo mis productos
router.get('/mios', verificarToken, async (req: AuthRequest, res: Response) => {
  try {
    const productos = await productosService.listarPropios(req.socio!.socioId);
    res.json(productos);
  } catch (error: any) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Actualizar producto
router.put('/:id', verificarToken, async (req: AuthRequest<{ id: string }>, res: Response) => {
  try {
    const producto = await productosService.actualizar(
      req.params.id,
      req.socio!.socioId,
      req.body
    );
    res.json(producto);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message });
  }
});

// Eliminar producto (soft delete)
router.delete('/:id', verificarToken, async (req: AuthRequest<{ id: string }>, res: Response) => {
  try {
    await productosService.eliminar(req.params.id, req.socio!.socioId);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message });
  }
});

export default router;