import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    ctx: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get('roles', ctx.getHandler());

    if (!validRoles || validRoles.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    if (!user) throw new BadRequestException('Usuario no encontrado');

    for (const role of user.roles) {
      if (validRoles.includes(role)) return true;
    }
    throw new ForbiddenException(
      `Usuario ${user.username} no autorizado para este recurso`,
    );
  }
}
