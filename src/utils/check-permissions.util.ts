import { UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';

/**
 * Utility class for checking user permissions.
 */
export class CheckPermissions {
  static check(requestUser: User, resourceUserId: string) {
    // Check if user is an admin or the owner of the resource
    if (requestUser.roles.includes('admin')) return;
    if (requestUser.id === resourceUserId.toString()) return;

    // Throw UnauthorizedError if user does not have permission
    throw new UnauthorizedException(
      'No autorizado para acceder a este recurso',
    );
  }
}
