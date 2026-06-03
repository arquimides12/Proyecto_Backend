import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { verificarToken } from '../middlewares/auth.middleware';
import { AuthRequest } from '../types';

const router = Router();
const authService = new AuthService();

// Registrar negocio nuevo con su admin
router.post('/registro', async (req: Request, res: Response) => {
  try {
    const negocio = await authService.registrarNegocio(req.body);
    res.status(201).json({ mensaje: 'Negocio creado', negocio });
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message });
  }
});

// Login de socio
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const resultado = await authService.login(email, password);
    res.json(resultado);
  } catch (error: any) {
    res.status(401).json({ mensaje: error.message });
  }
});

// Invitar socio (solo admin)
router.post('/invitar', verificarToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.socio?.rol !== 'ADMIN') {
      res.status(403).json({ mensaje: 'Solo el admin puede invitar socios' });
      return;
    }
    const socio = await authService.invitarSocio({
      ...req.body,
      negocioId: req.socio.negocioId
    });
    res.status(201).json({ mensaje: 'Socio invitado', socio });
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message });
  }
});

export default router;