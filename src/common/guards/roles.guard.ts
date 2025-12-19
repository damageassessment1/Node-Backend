import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Type } from '@nestjs/common';
import { UserRole } from '@prisma/client';


@Injectable()
class RolesGuardBase implements CanActivate {
  constructor(private readonly roles: UserRole[]) {}

  canActivate(context: ExecutionContext): boolean {
    // Bypass role checks completely when auth is disabled (local testing)
    if (process.env.DISABLE_AUTH === 'true') return true;
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasRole = this.roles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

// Factory to create a guard instance
export function RolesGuard(...roles: UserRole[]): Type<CanActivate> {
  @Injectable()
  class RoleGuardMixin extends RolesGuardBase {
    constructor() {
      super(roles);
    }
  }
  return RoleGuardMixin;
}
