import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verifyToken } from '../utils/jwt';
import { env } from '../../config/env';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.access_token;

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      const decoded = verifyToken(token, env.JWT_ACCESS_SECRET);
      request.userId = decoded.userId;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
