import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
      private readonly userService: UserService,
      private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if(user && user.matchPassword(password)) return user;
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      last_name: user.last_name,
      type_user: user.type_user
    };
    return this.generateTokens(payload);
  }

  async generateTokens(payload: any) {
    const accessToken = this.jwtService.sign({ ...payload, token_type: 'access' });
    const refreshToken = this.jwtService.sign(
        { ...payload, token_type: 'refresh' },
        { expiresIn: '1d' }
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
      if (!user) throw new UnauthorizedException('User not found');

      const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
        last_name: user.last_name,
        type_user: user.type_user
      };

      return this.generateTokens(payload);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
