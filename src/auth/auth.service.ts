import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async register(createUserDto: CreateUserDto) {
    const { username, email } = createUserDto;

    const [emailExist, usernameExist] = await this.prismaService.$transaction([
      this.prismaService.user.findUnique({ where: { email } }),
      this.prismaService.user.findUnique({ where: { username } }),
    ]);

    if (emailExist)
      throw new BadRequestException('El email está siendo utilizado');
    if (usernameExist)
      throw new BadRequestException(
        'El nombre de usuario está siendo utilizado',
      );

    const { password, ...data } = createUserDto;

    const user = await this.prismaService.user.create({
      data: {
        username: data.username.toLowerCase(),
        email: data.email.toLowerCase(),
        password: bcrypt.hashSync(password, 10),
      },
      select: { password: false, username: true, email: true, id: true },
    });

    return {
      ...user,
      token: this.getJwtToken({
        email: user.email,
        id: user.id,
        username: user.username,
      }),
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const { username, password } = loginUserDto;

    const user = await this.prismaService.user.findUnique({
      where: { username: username.toLowerCase() },
      select: { username: true, password: true, email: true, id: true },
    });

    if (!user)
      throw new UnauthorizedException(`Usuario o contraseña incorrectos`);

    const validPassword = bcrypt.compareSync(password, user.password);

    if (!validPassword)
      throw new UnauthorizedException('Usuario o contraseña incorrectos');

    return {
      ...user,
      token: this.getJwtToken({
        email: user.email,
        id: user.id,
        username: user.username,
      }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
