import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { ROLES } from './roles';
import { CreateUserDto } from '../user/dto/create-user';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (user && user.matchPassword(password) && user.isActive) return user;
    throw new UnauthorizedException('Invalid credentials');
  }

  async registerUser(body: CreateUserDto) {
    const user = await this.userService.create({
      ...body,
      type_user: ROLES.DEFAULT,
    });
    return this.login(user.email, user.password);
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload = {
      id: user.id,
      email: user.email,
      type_user: user.type_user,
    };

    return this.generateTokens(payload);
  }

  async generateTokens(payload: any) {
    const accessToken = this.jwtService.sign({
      ...payload,
      token_type: 'access',
    });
    const refreshToken = this.jwtService.sign(
      { ...payload, token_type: 'refresh' },
      { expiresIn: '7d' },
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 14400,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      if (decoded.token_type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.userService.findByEmail(decoded.email);
      if (user && !user.isActive)
        throw new UnauthorizedException('User not found');

      const payload = {
        id: user.id,
        email: user.email,
        type_user: user.type_user,
      };

      return this.generateTokens(payload);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
