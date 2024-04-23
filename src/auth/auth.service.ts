import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
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

    try {
      const { password, ...data } = createUserDto;

      const user = await this.prismaService.user.create({
        data: { ...data, password: bcrypt.hashSync(password, 10) },
      });

      delete user.password;

      return user;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Revisar logs de servidor');
    }
  }
}
