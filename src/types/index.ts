import { Request } from 'express';

export interface JwtPayload {
  socioId: string;
  negocioId: string;
  rol: string;
}

export interface AuthRequest<P = any, ResBody = any, ReqBody = any> extends Request<P, ResBody, ReqBody> {
  socio?: JwtPayload;
}