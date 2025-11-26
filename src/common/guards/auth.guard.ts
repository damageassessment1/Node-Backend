import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { PrismaService } from "src/modules/database/prisma.service";
import { baseUserSelect, citizenSelect } from "src/common/prisma/selects";

export const PUBLIC_END_POINT_KEY = "optionalAuth";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. Check if endpoint is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_END_POINT_KEY,
      [context.getHandler(), context.getClass()],
    );

    const token = this.extractToken(request);

    // 2. If public and no token → allow access without user
    if (isPublic && !token) {
      request["user"] = undefined;
      request["citizen"] = undefined;
      return true;
    }

    // 3. If no token and not public → block
    if (!token) {
      throw new UnauthorizedException("No token provided");
    }

    try {
      // 4. Verify token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // 5. Determine the model type from payload
      //    Assume token contains { sub: id, type: 'user' | 'citizen', email?: string }
      if (!payload.sub || !payload.type) {
        throw new UnauthorizedException("Invalid token payload");
      }

      if (payload.type === "user") {
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
          select: baseUserSelect,
        });
        if (!user) throw new UnauthorizedException("User not found");
        request["user"] = user;
        request["citizen"] = undefined;
      } else if (payload.type === "citizen") {
        const citizen = await this.prisma.citizen.findUnique({ where: { id: payload.sub }, select: citizenSelect });
        if (!citizen) throw new UnauthorizedException("Citizen not found");
        request["citizen"] = citizen;
        request["user"] = undefined;
      } else {
        throw new UnauthorizedException("Invalid token type");
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }

  private extractToken(req: Request): string | undefined {
    const authHeader = req.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(" ");
    return type === "Bearer" ? token : undefined;
  }
}
