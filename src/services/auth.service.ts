import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export class AuthService {

  async registrarNegocio(data: {
    negocioNombre: string;
    plan: 'SOLO' | 'MULTI';
    adminNombre: string;
    email: string;
    password: string;
  }) {
    const slug = data.negocioNombre.toLowerCase().replace(/\s+/g, '-');
    const passwordHash = await bcrypt.hash(data.password, 10);

    const negocio = await prisma.negocio.create({
      data: {
        nombre: data.negocioNombre,
        slug,
        plan: data.plan,
        socios: {
          create: {
            nombre: data.adminNombre,
            email: data.email,
            passwordHash,
            rol: 'ADMIN',
          }
        }
      },
      include: { socios: true }
    });

    return negocio;
  }

  async login(email: string, password: string) {
    const socio = await prisma.socio.findUnique({
      where: { email },
      include: { negocio: true }
    });

    if (!socio) throw new Error('Credenciales inválidas');

    const valido = await bcrypt.compare(password, socio.passwordHash);
    if (!valido) throw new Error('Credenciales inválidas');

    const token = jwt.sign(
      { socioId: socio.id, negocioId: socio.negocioId, rol: socio.rol },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    return {
      token,
      socio: {
        id: socio.id,
        nombre: socio.nombre,
        email: socio.email,
        rol: socio.rol,
        negocio: socio.negocio
      }
    };
  }

  async invitarSocio(data: {
    negocioId: string;
    nombre: string;
    email: string;
    password: string;
  }) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    return prisma.socio.create({
      data: {
        negocioId: data.negocioId,
        nombre: data.nombre,
        email: data.email,
        passwordHash,
        rol: 'SOCIO'
      }
    });
  }
}