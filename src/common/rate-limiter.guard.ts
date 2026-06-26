import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private store = new Map<string, RateLimitEntry>();

  constructor(
    private readonly maxRequests: number = 30,
    private readonly windowMs: number = 60_000,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip || request.socket?.remoteAddress || 'unknown';
    const now = Date.now();

    let entry = this.store.get(ip);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + this.windowMs };
      this.store.set(ip, entry);
    }

    entry.count++;

    if (entry.count > this.maxRequests) {
      throw new HttpException('Demasiadas solicitudes. Intente de nuevo más tarde.', HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }
}
