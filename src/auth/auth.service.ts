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
import { User } from '@prisma/client';
import { OpenaiConfigService } from 'src/openai-config/openai-config.service';
import { ModelInitService } from 'src/shared/services/model-init/model-init.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly openAIConfigService: OpenaiConfigService,
    private readonly modelInitService: ModelInitService,
  ) {}
  async register(createUserDto: CreateUserDto) {
    const { username, email } = createUserDto;

    const emailExist = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (emailExist)
      throw new BadRequestException('El email está siendo utilizado');

    const usernameExist = await this.prismaService.user.findUnique({
      where: { username },
    });
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

    await this.openAIConfigService.saveConfig({}, user.id);

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
      select: {
        username: true,
        password: true,
        email: true,
        id: true,
        isActive: true,
      },
    });

    if (!user)
      throw new UnauthorizedException(`Usuario o contraseña incorrectos`);

    const validPassword = bcrypt.compareSync(password, user.password);

    if (!validPassword)
      throw new UnauthorizedException('Usuario o contraseña incorrectos');

    if (!user.isActive) throw new UnauthorizedException('Usuario inactivo');

    delete user.password;
    delete user.isActive;

    const config = await this.openAIConfigService.getConfig(user.id);

    if (config.openAIApiKey)
      await this.modelInitService.initModel(config, user.id);

    return {
      ...user,
      token: this.getJwtToken({
        email: user.email,
        id: user.id,
        username: user.username,
      }),
    };
  }

  checkAuthStatus(user: User) {
    delete user.roles;

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
