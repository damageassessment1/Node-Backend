import { Module } from "@nestjs/common";
import { AuthService } from "./services/auth.service";
import { JwtModule } from "@nestjs/jwt";
import { DatabaseModule } from "../database/database.module";
import { CitizenAuthController } from "./controllers/citizen-auth.controller";
import { AdminAuthController } from "./controllers/admin-auth.controller";
// import { MailService } from "src/common/services/mail.service";
// import { PasswordResetService } from "./services/password-reset.service";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "604800s" },
    }),
    DatabaseModule,
  ],
  providers: [AuthService],//PasswordResetService,MailService
  controllers: [AdminAuthController,CitizenAuthController],
  exports: [JwtModule], // Export JwtModule so other modules can use it
})
export class AuthModule {}
