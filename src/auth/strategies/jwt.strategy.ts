import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { envs } from 'src/config/envs.adapter';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prismaService: PrismaService) {
    super({
      secretOrKey: envs.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { username } = payload;

    const user = await this.prismaService.user.findUnique({
      where: { username },
    });

    if (!user) throw new UnauthorizedException('Token no valido');

    if (!user.isActive)
      throw new UnauthorizedException('El usuario no está activo');

    // Se añade user a la request
    return user;
  }
}
