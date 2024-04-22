import { BadRequestException, Injectable } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
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
  }
}
