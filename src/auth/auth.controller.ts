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
import {CreateUserDto} from "../user/dto/create-user";
import {User} from "../user/user.schema";
import {ROLES} from "./roles";
import {LoginDto} from "./dto/login";

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

  @Post('register')
  async create(@Body() body: CreateUserDto): Promise<any> {
    return this.authService.registerUser(body);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login utente',
    description: 'Effettua il login inviando email e password nel body',
  })
  @ApiOkResponse({
    description: 'Autenticazione riuscita, restituisce il token JWT',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Email o password mancanti o non validi' })
  @ApiUnauthorizedResponse({ description: 'Credenziali errate' })
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;

    if (!email || !password) {
      throw new HttpException('Email and password are required', HttpStatus.BAD_REQUEST);
    }

    return this.authService.login(email, password);
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
