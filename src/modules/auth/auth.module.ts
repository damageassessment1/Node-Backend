import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { DatabaseModule } from "../database/database.module";
import { CitizenAuthController } from "./controllers/citizen-auth.controller";
import { AdminAuthController } from "./controllers/admin-auth.controller";
import { AdminAuthService } from "./services/admin-auth.service";
import { CitizenAuthService } from "./services/citizen-auth.service";
import { CitizenVerificationService } from "./services/citizen-verification.service";
import { SupabaseService } from "src/common/services";
import { StorageService } from "../storage/storage.service";
import { MailService } from "src/common/services/mail.service";
import { PasswordResetService } from "./services/password-reset.service";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "604800s" },
    }),
    DatabaseModule,
  ],
  providers: [
    AdminAuthService,
    CitizenAuthService,
    CitizenVerificationService,
    SupabaseService,
    StorageService,
    PasswordResetService,
    MailService,
  ],
  controllers: [AdminAuthController, CitizenAuthController],
  exports: [JwtModule], // Export JwtModule so other modules can use it
})
export class AuthModule { }
