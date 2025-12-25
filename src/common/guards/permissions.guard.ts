import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from "@nestjs/common";
import { PrismaService } from "src/modules/database/prisma.service";
import { PERMISSIONS_KEY } from "../decorators/requir-permission.decorator";
import { Reflector } from "@nestjs/core";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext) {
    const required = this.reflector.get<string[]>(
      PERMISSIONS_KEY,
      context.getHandler()
    );

    if (!required) return true;

    const { user } = context.switchToHttp().getRequest();

    
    const role = await this.prisma.role.findUnique({
      where: { id: user.role.id },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    if (!role) {
      return false; // or throw ForbiddenException
    }

    const userPermissions = role.permissions.map((rp) => rp.permission.key);

    return required.every((p) => userPermissions.includes(p));
  }
}
