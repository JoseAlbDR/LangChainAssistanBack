import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { User } from '@prisma/client';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();

  const user = req.user;

  if (!user)
    throw new InternalServerErrorException('Usuario no encontrado (request)');

  let options: { user?: User; email?: string };

  if (!data) options = { ...options, ...user };
  if (data) options = { ...options, [data]: user[data] };

  return { ...options };
});
