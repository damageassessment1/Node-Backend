import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { JwtService } from "@nestjs/jwt";
import { ChangePasswordDto, CompleteSignupDto, SigninDto } from "../dto";
import { baseUserSelect } from "src/common/prisma/selects";
import { PrismaService } from "../../database/prisma.service";
import { Citizen, User, VerificationStatus } from "@prisma/client";
import { PasswordResetService } from "./password-reset.service";

export interface VerificationQuestion {
  key: string;
  question: string;
  en_question: string;
}

@Injectable()
export class AdminAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private passwordResetService: PasswordResetService
  ) { }

  async adminSignIn(dto: SigninDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });
    if (!user) throw new UnauthorizedException("Invalid credentials");
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException("Invalid credentials");

    const token = await this.jwtService.signAsync({
      sub: user.id,
      type: "user",
      email: user.email,
      role: user.role.name,
    });
    const { password, ...safeUser } = user as any;
    return { access_token: token, user: safeUser };
  }

  async adminChangePassword(dto: ChangePasswordDto, user: User) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, password: true },
    });

    if (!existingUser) {
      throw new UnauthorizedException("المستخدم غير موجود");
    }

    if (!existingUser.password) {
      throw new UnauthorizedException("التسجيل غير مكتمل");
    }

    // Verify old password
    const isMatch = await bcrypt.compare(dto.oldPassword, existingUser.password);
    if (!isMatch) {
      throw new UnauthorizedException("كلمة المرور القديمة غير صحيحة");
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return {
      success: true,
      message: "تم تغيير كلمة المرور بنجاح",
    };
  }

  async adminResetPasswordRequest(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    return this.passwordResetService.requestReset(
      user,
      (id, data) => this.prisma.user.update({ where: { id }, data }),
      "/admin/reset-password"
    );
  }

  async adminResetPassword(token: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.passwordResetService.resetPassword(
      token,
      (id) => this.prisma.user.findUnique({ where: { id } }),
      (id, data) =>
        this.prisma.user.update({
          where: { id },
          data: { ...data, password: hashedPassword },
        })
    );
  }
}
