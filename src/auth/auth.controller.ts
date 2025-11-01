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
import { Response } from 'express';
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
import { CreateUserDto } from '../user/dto/create-user';
import { LoginDto } from './dto/login';

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
  @ApiBadRequestResponse({
    description: 'Email o password mancanti o non validi',
  })
  @ApiUnauthorizedResponse({ description: 'Credenziali errate' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response, // inject Express response
  ) {
    const { email, password } = loginDto;

    if (!email || !password) {
      throw new HttpException(
        'Email and password are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const token = await this.authService.login(email, password);

    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', token.refresh_token, {
      httpOnly: true,
      secure: true, // set to true in production (HTTPS)
      sameSite: 'none', // adjust if frontend is on a different domain
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return access token + user info
    return {
      accessToken: token.access_token,
      expiresIn: token.expires_in,
    };
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh token JWT',
    description: 'Genera un nuovo access token usando un refresh token valido',
  })
  @ApiOkResponse({ description: 'Nuovo access token generato con successo' })
  @ApiUnauthorizedResponse({
    description: 'Refresh token non valido o scaduto',
  })
  async refresh(@Req() req, @Res({ passthrough: true }) res) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new HttpException('Missing refresh token', HttpStatus.BAD_REQUEST);
    }
    const token = await this.authService.refreshAccessToken(refreshToken);

    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', token.refresh_token, {
      httpOnly: true,
      secure: true, // set to true in production (HTTPS)
      sameSite: 'none', // adjust if frontend is on a different domain
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return access token + user info
    return {
      accessToken: token.access_token,
      expiresIn: token.expires_in,
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }
}
