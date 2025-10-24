import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: any, status?: any) {
    if (info instanceof Error) {
      // Controlla se il token è scaduto
      if (info.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          statusCode: 401,
          error: 'Token Expired',
          message: 'Access token has expired, please refresh it',
          code: 'TOKEN_EXPIRED', // Codice personalizzato per il frontend
        });
      }

      // Altri errori JWT
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'Invalid Token',
        message: 'Invalid authentication token',
        code: 'INVALID_TOKEN',
      });
    }

    return super.handleRequest(err, user, info, context, status);
  }
}
