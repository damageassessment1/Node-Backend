// import { Injectable, UnauthorizedException } from "@nestjs/common";
// import { JwtService } from "@nestjs/jwt";
// import { MailService } from "src/common/services/mail.service";
// import * as bcrypt from "bcryptjs";

// @Injectable()
// export class PasswordResetService {
//   constructor(
//     private jwtService: JwtService,
//     private mailService: MailService
//   ) {}

//   async requestReset(
//     entity: any,
//     updateFn: (id: number, data: any) => Promise<any>,
//     frontendPath: string
//   ) {
//     if (!entity) {
//       throw new UnauthorizedException("البريد الإلكتروني غير موجود");
//     }

//     const token = this.jwtService.sign(
//       { sub: entity.id, type: "password-reset" },
//       { expiresIn: "1h" }
//     );

//     const hashedToken = await bcrypt.hash(token, 10);

//     await updateFn(entity.id, {
//       resetToken: hashedToken,
//       resetTokenExpiry: new Date(Date.now() + 3600000),
//     });

//     const link = `${process.env.FRONTEND_URL}${frontendPath}?token=${token}`;

//     this.mailService.sendResetPasswordEmail(
//       entity.email,
//       entity.name || entity.first_name || "User",
//       link
//     );

//     return {
//       message: "إذا كان البريد الإلكتروني موجود سيتم إرسال الرابط",
//     };
//   }

//   async resetPassword(
//     token: string,
//     findValidFn: () => Promise<any>,
//     updateFn: (id: number, data: any) => Promise<any>
//   ) {
//     try {
//       this.jwtService.verify(token);
//     } catch {
//       throw new UnauthorizedException("الرابط غير صالح أو منتهي");
//     }

//     const records = await findValidFn();

//     const entity = await this.matchToken(records, token);
//     if (!entity) {
//       throw new UnauthorizedException("الرابط غير صالح");
//     }

//     await updateFn(entity.id, {
//       password: await bcrypt.hash(entity.password, 10),
//       resetToken: null,
//       resetTokenExpiry: null,
//     });

//     return { success: true };
//   }

//   private async matchToken(records: any, token: string) {
//     for (const r of records) {
//       if (r.resetToken && (await bcrypt.compare(token, r.resetToken))) {
//         return r;
//       }
//     }
//     return null;
//   }
// }
