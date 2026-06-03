import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Rutas
import authRoutes from './routes/auth.routes';
import productosRoutes from './routes/productos.routes';
import inventarioRoutes from './routes/inventario.routes';
import reportesRoutes from './routes/reportes.routes';
import ventasRoutesFactory from './routes/ventas.routes';

const app = express();
const httpServer = createServer(app);

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middlewares globales
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutesFactory(io));
app.use('/api/inventario', inventarioRoutes);
app.use('/api/reportes', reportesRoutes);

// Ruta de salud — para verificar que el servidor corre
app.get('/api/health', (_req, res) => {
  res.json({ estado: 'ok', mensaje: 'Servidor corriendo' });
});

// WebSocket — eventos de conexión
io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  socket.on('unirse:negocio', (negocioId: string) => {
    socket.join(negocioId);
    console.log(`Socket ${socket.id} se unió al negocio ${negocioId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

// Iniciar servidor
const PORT = process.env.PORT ?? 3000;
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`WebSocket listo en ws://localhost:${PORT}`);
});