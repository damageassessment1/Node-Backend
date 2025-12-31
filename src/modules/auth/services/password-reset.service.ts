import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { MailService } from "src/common/services/mail.service";
import * as bcrypt from "bcryptjs";

@Injectable()
export class PasswordResetService {
  constructor(
    private jwtService: JwtService,
    private mailService: MailService
  ) { }

  async requestReset(
    entity: any,
    updateFn: (id: number, data: any) => Promise<any>,
    frontendPath: string
  ) {
    if (!entity) {
      throw new UnauthorizedException("البريد الإلكتروني غير موجود");
    }

    const token = this.jwtService.sign(
      { sub: entity.id, type: "password-reset" },
      { expiresIn: "1h" }
    );

    const hashedToken = await bcrypt.hash(token, 10);

    await updateFn(entity.id, {
      resetToken: hashedToken,
      resetTokenExpiry: new Date(Date.now() + 3600000),
    });

    const link = `${process.env.FRONTEND_URL}${frontendPath}?token=${token}`;

    this.mailService.sendResetPasswordEmail(
      entity.email,
      entity.name || entity.first_name || "User",
      link
    );

    return {
      message: "إذا كان البريد الإلكتروني موجود سيتم إرسال الرابط",
    };
  }

  async resetPassword(
    token: string,
    findUserFn: (id: any) => Promise<any>,
    updateFn: (id: number, data: any) => Promise<any>
  ) {
    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException("الرابط غير صالح أو منتهي");
    }

    const entity = await findUserFn(payload.sub);
    if (!entity || !entity.resetToken) {
      throw new UnauthorizedException("الرابط غير صالح");
    }

    const isMatch = await bcrypt.compare(token, entity.resetToken);
    if (!isMatch) {
      throw new UnauthorizedException("الرابط غير صالح");
    }

    // Pass data directly (password should be hashed by caller)
    await updateFn(entity.id, {
      resetToken: null,
      resetTokenExpiry: null,
    });

    return { success: true };
  }
}
