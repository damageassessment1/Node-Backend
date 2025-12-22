import * as nodemailer from "nodemailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {
    
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendResetPasswordEmail(email: string, name: string, link: string) {
    await this.transporter.sendMail({
      from: '"Support" <no-reply@yourdomain.com>',
      to: email,
      subject: "إعادة تعيين كلمة المرور",
      html: `
        <p>مرحبًا ${name}</p>
        <p>اضغط على الرابط لإعادة تعيين كلمة المرور:</p>
        <a href="${link}">إعادة تعيين كلمة المرور</a>
        <p>الرابط صالح لمدة ساعة واحدة</p>
      `,
    });
  }
}


// // mail.service.ts
// import { Injectable } from "@nestjs/common";
// import { Resend } from "resend";

// @Injectable()
// export class MailService {
//   private resend = new Resend(process.env.RESEND_API_KEY);

//   async sendResetPasswordEmail(
//     email: string,
//     name: string,
//     link: string
//   ) {
//     await this.resend.emails.send({
//       from: "Support <no-reply@yourdomain.com>",
//       to: email,
//       subject: "إعادة تعيين كلمة المرور",
//       html: `
//         <p>مرحبًا ${name}</p>
//         <p>اضغط على الرابط لإعادة تعيين كلمة المرور:</p>
//         <a href="${link}">إعادة تعيين كلمة المرور</a>
//         <p>الرابط صالح لمدة ساعة</p>
//       `,
//     });
//   }
// }

