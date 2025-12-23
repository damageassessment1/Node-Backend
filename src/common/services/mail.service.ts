import { Injectable } from "@nestjs/common";
import Mailgun from "mailgun.js";
import * as FormData from "form-data";

@Injectable()
export class MailService {
  private mg;

  constructor() {
    const mailgun = new Mailgun(FormData);
    this.mg = mailgun.client({
      username: "api",
      key: process.env.MAILGUN_API_KEY!,
    });
  }

  async sendResetPasswordEmail(
    to: string,
    name: string,
    resetLink: string
  ) {
    return this.mg.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: `Support <${process.env.MAIL_FROM}>`,
      to,
      subject: "إعادة تعيين كلمة المرور",
      html: `
        <p>مرحباً ${name}</p>
        <p>اضغط على الرابط لإعادة تعيين كلمة المرور:</p>
        <a href="${resetLink}">إعادة تعيين كلمة المرور</a>
      `,
    });
  }
}

// import { Injectable } from "@nestjs/common";
// import * as nodemailer from "nodemailer";

// @Injectable()
// export class MailService {

//   private transporter = nodemailer.createTransport({
//     host: process.env.MAILTRAP_HOST,
//       port: Number(process.env.MAILTRAP_PORT),
//       auth: {
//         user: process.env.MAILTRAP_USER,
//         pass: process.env.MAILTRAP_PASS,
//       },
//       connectionTimeout: 10000,
//       greetingTimeout: 10000,
//       socketTimeout: 10000,
//   });

//   async sendResetPasswordEmail(
//     to: string,
//     name: string,
//     resetLink: string
//   ) {
//     return this.transporter.sendMail({
//       from: process.env.MAIL_FROM,
//       to,
//       subject: "إعادة تعيين كلمة المرور",
//       html: `
//         <p>مرحباً ${name}</p>
//         <p>اضغط على الرابط لإعادة تعيين كلمة المرور:</p>
//         <a href="${resetLink}">إعادة تعيين كلمة المرور</a>
//       `,
//     });
//   }
// }




// import * as nodemailer from "nodemailer";
// import { Injectable } from "@nestjs/common";

// @Injectable()
// export class MailService {
    
//   private transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: 587,
//     secure: false,
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });

//   async sendResetPasswordEmail(email: string, name: string, link: string) {
//     await this.transporter.sendMail({
//       from: '"Support" <no-reply@yourdomain.com>',
//       to: email,
//       subject: "إعادة تعيين كلمة المرور",
//       html: `
//         <p>مرحبًا ${name}</p>
//         <p>اضغط على الرابط لإعادة تعيين كلمة المرور:</p>
//         <a href="${link}">إعادة تعيين كلمة المرور</a>
//         <p>الرابط صالح لمدة ساعة واحدة</p>
//       `,
//     });
//   }
// }


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

