import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { JwtService } from "@nestjs/jwt";
import { ChangePasswordDto, CompleteSignupDto } from "../dto";
import { PrismaService } from "../../database/prisma.service";
import { Citizen, VerificationStatus, Prisma } from "@prisma/client";
import { StorageService } from "src/modules/storage/storage.service";
import { PasswordResetService } from "./password-reset.service";

@Injectable()
export class CitizenAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private readonly storageService: StorageService,
    private passwordResetService: PasswordResetService
  ) { }

  async completeCitizenSignup(
    dto: CompleteSignupDto,
    uploads: {
      avatar: Express.Multer.File;
    }
  ) {
    const citizen = await this.prisma.citizen.findUnique({
      where: { national_id: dto.nationalId },
    });

    if (!citizen) {
      throw new UnauthorizedException("المواطن غير موجود");
    }

    if (citizen.password) {
      throw new ConflictException(
        "تم إكمال التسجيل مسبقاً. يرجى تسجيل الدخول."
      );
    }

    if (
      citizen.verification_status !== VerificationStatus.NATIONAL_ID_VERIFIED
    ) {
      throw new ForbiddenException("يجب إكمال التحقق من الهوية قبل التسجيل");
    }

    let avatar: string | null = null;
    if (uploads && uploads.avatar) {
      const [file] = await this.storageService.handleUploads(
        uploads.avatar,
        "avatars"
      );
      avatar = file.url;
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    try {
      const updated = await this.prisma.citizen.update({
        where: { national_id: dto.nationalId },
        data: {
          avatar,
          password: hashed,
          first_name: dto.firstName,
          father_name: dto.fatherName,
          grandfather_name: dto.grandfatherName,
          family_members_number: Number(dto.familyMembersNumber),
          family_name: dto.familyName,
          full_name: `${dto.firstName} ${dto.fatherName} ${dto.grandfatherName} ${dto.familyName}`,
          phone_number: dto.phoneNumber,
          email: dto.email,
          whatsapp_number: dto.whatsappNumber,
          verification_status: VerificationStatus.QUESTIONS_VERIFIED,
        },
      });

      const { password: _, ...user } = updated;

      const token = this.jwtService.sign({
        sub: updated.id,
        national_id: updated.national_id,
        type: "citizen",
      });

      return {
        success: true,
        message: "تم إكمال التسجيل بنجاح",
        user,
        token,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          // Unique constraint violation
          const target = (error.meta?.target as string[]) || [];
          if (target.includes("email")) {
            throw new ConflictException("البريد الإلكتروني مستخدم بالفعل");
          }
          if (target.includes("phone_number")) {
            throw new ConflictException("رقم الهاتف مستخدم بالفعل");
          }
          if (target.includes("whatsapp_number")) {
            throw new ConflictException("رقم الواتساب مستخدم بالفعل");
          }
          throw new ConflictException("البيانات المدخلة مستخدمة بالفعل");
        }
      }
      throw error;
    }
  }

  async citizenLogin(national_id: string, password: string) {
    // 1. Find citizen
    const citizen = await this.prisma.citizen.findUnique({
      where: { national_id },
      include: { applications: { include: { locations: true } } },
    });

    if (!citizen) {
      throw new UnauthorizedException("المستخدم غير موجود");
    }

    // 2. Ensure signup is completed
    if (!citizen.password) {
      throw new ForbiddenException("لم يتم إكمال التسجيل بعد");
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, citizen.password);
    if (!isMatch) {
      throw new UnauthorizedException("كلمة المرور غير صحيحة");
    }

    // 4. Generate token
    const token = this.jwtService.sign({
      sub: citizen.id,
      national_id: citizen.national_id,
      type: "citizen",
    });

    const { password: _, ...user } = citizen;

    return {
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      user,
      token,
    };
  }

  async citizenChangePassword(dto: ChangePasswordDto, citizen: Citizen) {
    const existingCitizen = await this.prisma.citizen.findUnique({
      where: { id: citizen.id },
      select: { id: true, password: true },
    });

    if (!existingCitizen) {
      throw new UnauthorizedException("المستخدم غير موجود");
    }

    if (!existingCitizen.password) {
      throw new UnauthorizedException("التسجيل غير مكتمل");
    }

    // Verify old password
    const isMatch = await bcrypt.compare(
      dto.oldPassword,
      existingCitizen.password
    );
    if (!isMatch) {
      throw new UnauthorizedException("كلمة المرور القديمة غير صحيحة");
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.citizen.update({
      where: { id: existingCitizen.id },
      data: { password: hashedPassword },
    });

    return {
      success: true,
      message: "تم تغيير كلمة المرور بنجاح",
    };
  }

  async citizenResetPasswordRequest(email: string) {
    const citizen = await this.prisma.citizen.findFirst({ where: { email } });

    return this.passwordResetService.requestReset(
      citizen,
      (id, data) => this.prisma.citizen.update({ where: { id }, data }),
      "/citizen/reset-password"
    );
  }

  async citizenResetPassword(token: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.passwordResetService.resetPassword(
      token,
      (id) => this.prisma.citizen.findUnique({ where: { id } }),
      (id, data) =>
        this.prisma.citizen.update({
          where: { id },
          data: { ...data, password: hashedPassword },
        })
    );
  }
}
