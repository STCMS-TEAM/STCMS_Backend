import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Render,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
@ApiTags('Authentication') // Gruppo di endpoint per l'autenticazione
export class AuthController {
  private readonly URL;
  constructor(
    private _configService: ConfigService,
    private authService: AuthService,
  ) {
    this.URL = this._configService.get<string>('URL');
  }

  @Get('login')
  @ApiOperation({
    summary: 'Login utente',
    description: 'Supporta un metodo di autenticazione: Basic Auth (email:password)'
  })
  @ApiHeader({
    name: 'authorization',
    description: 'Credenziali Basic Auth (formato: "Basic base64(email:password)")',
    required: false
  })
  @ApiOkResponse({ description: 'Autenticazione riuscita, restituisce il token JWT' })
  @ApiBadRequestResponse({ description: 'Formato delle credenziali non valido' })
  @ApiUnauthorizedResponse({ description: 'Metodo di autenticazione non valido o credenziali errate' })
  async login(@Headers() headers: string) {
    const authHeader = headers["authorization"];

    if (authHeader != undefined) {
      const base64Credentials = authHeader.split(' ')[1];

      if (!base64Credentials) {
        throw new HttpException('Invalid Authorization header format', HttpStatus.BAD_REQUEST);
      }

      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [email, password] = credentials.split(':');

      if (!email || !password) {
        throw new HttpException('Invalid credentials format', HttpStatus.BAD_REQUEST);
      }

      return this.authService.login(email, password);
    }

    throw new UnauthorizedException('Invalid authentication method');
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh token JWT',
    description: 'Genera un nuovo access token usando un refresh token valido'
  })
  @ApiHeader({
    name: 'authorization',
    description: 'Refresh token (formato: "Bearer refresh_token")',
    required: true
  })
  @ApiOkResponse({ description: 'Nuovo access token generato con successo' })
  @ApiBadRequestResponse({ description: 'Header Authorization mancante o malformato' })
  @ApiUnauthorizedResponse({ description: 'Refresh token non valido o scaduto' })
  async refresh(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpException('Invalid authorization header', HttpStatus.BAD_REQUEST);
    }

    const refreshToken = authHeader.split(' ')[1];
    return this.authService.refreshAccessToken(refreshToken);
  }
}
