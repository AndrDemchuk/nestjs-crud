import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const role = request.headers['role'];
    if (role !== 'admin') {
      throw new UnauthorizedException('Access denied: Admins only');
    }
    return true;
  }
}
