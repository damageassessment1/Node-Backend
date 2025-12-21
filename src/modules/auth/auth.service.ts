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
import { ChangePasswordDto, CompleteSignupDto, SigninDto } from "./dto";
import { baseUserSelect } from "src/common/prisma/selects";
import { PrismaService } from "../database/prisma.service";
import { Citizen, VerificationStatus } from "@prisma/client";
import { generateApplicationId } from "src/common/utils";

export interface VerificationQuestion {
  key: string;
  question: string;
  en_question: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async verifyNationalId(nationalId: string) {
    const idNum = Number(nationalId);
    if (Number.isNaN(idNum) || idNum <= 0) {
      throw new UnauthorizedException("الرقم الوطني غير صالح");
    }

    // Fetch person with relations using national_id field
    const person = await this.prisma.person.findUnique({
      where: { national_id: nationalId },
      include: {
        relations: {
          include: {
            relationCode: true,
            relativePerson: true,
          },
        },
      },
    });

    if (!person) {
      throw new UnauthorizedException("الرقم الوطني غير موجود في السجل المدني");
    }

    // Upsert citizen record
    const { citizen, message } =
      await this.upsertCitizenToNationalVerified(nationalId);

    // Build verification questions
    const allQuestions = this.buildVerificationQuestions(person);

    if (allQuestions.length === 0) {
      throw new HttpException(
        "بيانات غير كافية لتوليد أسئلة التحقق",
        HttpStatus.BAD_REQUEST
      );
    }

    // Select 2 random questions

    const selectedQuestions = this.selectRandomQuestions(allQuestions, 2);

    return {
      success: true,
      message,
      verification_status: citizen.verification_status,
      questions: selectedQuestions,
    };
  }

  async verifySecurityQuestions(
    nationalId: string,
    answers: Record<string, string>
  ) {
    const citizen = await this.prisma.citizen.findUnique({
      where: { national_id: nationalId },
    });

    if (!citizen) {
      throw new UnauthorizedException("المواطن غير موجود");
    }

    if (
      citizen.verification_status === VerificationStatus.QUESTIONS_VERIFIED &&
      citizen.password
    ) {
      throw new ForbiddenException(
        "تم التحقق من الرقم الوطني مسبقاً توجه لصفحة الدخول"
      );
    }

    // Parse question keys and validate answers
    const isValid = await this.validateAnswers(nationalId, answers);

    if (!isValid) {
      throw new UnauthorizedException(
        "فشل التحقق من الهوية - إجابات غير صحيحة"
      );
    }

    // Update verification status
    await this.prisma.citizen.update({
      where: { national_id: nationalId },
      data: {
        verification_status: VerificationStatus.NATIONAL_ID_VERIFIED,
      },
    });

    return {
      success: true,
      message: "تم التحقق من الأسئلة الأمنية بنجاح. يمكنك الآن إكمال التسجيل.",
    };
  }

  async completeCitizenSignup(dto: CompleteSignupDto) {
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

    const hashed = await bcrypt.hash(dto.password, 10);

    const updated = await this.prisma.citizen.update({
      where: { national_id: dto.nationalId },
      data: {
        password: hashed,
        first_name: dto.firstName,
        father_name: dto.fatherName,
        grandfather_name: dto.grandfatherName,
        family_members_number:dto.familyMembersNumber,
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

    // Remove password and send user object with application
    const { password: _, ...user } = citizen;

    return {
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      user,
      token,
    };
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private async upsertCitizenToNationalVerified(nationalId: string) {
    let citizen = await this.prisma.citizen.findUnique({
      where: { national_id: nationalId },
    });

    if (citizen) {
      // Check if already at or beyond national_id_verified stage

      if (
        citizen.verification_status === VerificationStatus.QUESTIONS_VERIFIED &&
        citizen.password
      ) {
        throw new ForbiddenException(
          "تم التحقق من الرقم الوطني مسبقاً توجه لصفحة الدخول"
        );
      }

      return {
        citizen,
        message: "تم التحقق من الرقم الوطني للمواطن الموجود",
      };
    }

    // Create new citizen
    try {
      const newCitizen = await this.prisma.citizen.create({
        data: {
          national_id: nationalId,
        },
      });

      return {
        citizen: newCitizen,
        message: "تم إنشاء المواطن والتحقق من الرقم الوطني",
      };
    } catch (error) {
      // Handle race condition
      if ((error as any)?.code === "P2002") {
        const existing = await this.prisma.citizen.findUnique({
          where: { national_id: nationalId },
        });

        if (existing) {
          const updated = await this.prisma.citizen.update({
            where: { national_id: nationalId },
            data: {
              verification_status: VerificationStatus.NATIONAL_ID_VERIFIED,
            },
          });

          return {
            citizen: updated,
            message: "تم التحقق من الرقم الوطني (تم معالجة الإنشاء المتزامن)",
          };
        }
      }

      throw new HttpException(
        "فشل التحقق من الرقم الوطني",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private buildVerificationQuestions(person: any): VerificationQuestion[] {
    const questions: VerificationQuestion[] = [];
    const relations = person.relations || [];

    const children = this.getRelativesByCode(relations, "Son");
    const sons = children.filter(
      (rel) => rel.relativePerson?.sexCode === "ذكر"
    );
    const daughters = children.filter(
      (rel) => rel.relativePerson?.sexCode === "أنثى"
    );
    const spouse = this.getRelativesByCode(relations, "Spouse");
    const father = this.getRelativesByCode(relations, "Father");
    const mother = this.getRelativesByCode(relations, "Mother");

    // Sons
    sons.forEach((rel, index) => {
      const son = rel.relativePerson;
      if (son?.firstName) {
        // National ID
        questions.push({
          key: `son_${index}_${son.id}_nid`,
          question: `ما هو الرقم الوطني لابنك ${son.firstName}؟`,
          en_question: `What is the national ID of your son (${son.firstName})?`,
        });

        // Birth date
        if (son.birthDate) {
          questions.push({
            key: `son_${index}_${son.id}_bd`,
            question: `ما هو تاريخ ميلاد ابنك ${son.firstName}؟ (يوم/شهر/سنة)`,
            en_question: `What is the birth date of your son (${son.firstName})? (DD/MM/YYYY)`,
          });
        }
      }
    });

    // Daughters
    daughters.forEach((rel, index) => {
      const daughter = rel.relativePerson;
      if (daughter?.firstName) {
        questions.push({
          key: `daughter_${index}_${daughter.id}_nid`,
          question: `ما هو الرقم الوطني لابنتك ${daughter.firstName}؟`,
          en_question: `What is the national ID of your daughter (${daughter.firstName})?`,
        });

        if (daughter.birthDate) {
          questions.push({
            key: `daughter_${index}_${daughter.id}_bd`,
            question: `ما هو تاريخ ميلاد ابنتك ${daughter.firstName}؟ (يوم/شهر/سنة)`,
            en_question: `What is the birth date of your daughter (${daughter.firstName})? (DD/MM/YYYY)`,
          });
        }
      }
    });

    // Spouse
    if (spouse.length > 0) {
      const spouseData = spouse[0].relativePerson;
      if (spouseData) {
        questions.push({
          key: `spouse_${spouseData.id}_nid`,
          question: `ما هو الرقم الوطني لزوجك/زوجتك؟`,
          en_question: `What is the national ID of your spouse (${spouseData.firstName})?`,
        });

        if (spouseData.birthDate) {
          questions.push({
            key: `spouse_${spouseData.id}_bd`,
            question: `ما هو تاريخ ميلاد زوجك/زوجتك؟ (يوم/شهر/سنة)`,
            en_question: `What is the birth date of your spouse (${spouseData.firstName})? (DD/MM/YYYY)`,
          });
        }
      }
    }

    // Personal
    if (person.birthDate) {
      questions.push({
        key: `personal_${person.id}_bd`,
        question: `ما هو تاريخ ميلادك؟ (يوم/شهر/سنة)`,
        en_question: `What is your birth date? (DD/MM/YYYY)`,
      });
    }

    // Father
    if (father.length > 0) {
      const fatherData = father[0].relativePerson;
      if (fatherData) {
        questions.push({
          key: `father_${fatherData.id}_nid`,
          question: `ما هو الرقم الوطني لوالدك؟`,
          en_question: `What is the national ID of your father (${fatherData.firstName})?`,
        });

        if (fatherData.birthDate) {
          questions.push({
            key: `father_${fatherData.id}_bd`,
            question: `ما هو تاريخ ميلاد والدك؟ (يوم/شهر/سنة)`,
            en_question: `What is the birth date of your father (${fatherData.firstName})? (DD/MM/YYYY)`,
          });
        }
      }
    }

    // Mother
    if (mother.length > 0) {
      const motherData = mother[0].relativePerson;
      if (motherData) {
        questions.push({
          key: `mother_${motherData.id}_nid`,
          question: `ما هو الرقم الوطني لوالدتك؟`,
          en_question: `What is the national ID of your mother (${motherData.firstName})?`,
        });

        if (motherData.birthDate) {
          questions.push({
            key: `mother_${motherData.id}_bd`,
            question: `ما هو تاريخ ميلاد والدتك؟ (يوم/شهر/سنة)`,
            en_question: `What is the birth date of your mother (${motherData.firstName})? (DD/MM/YYYY)`,
          });
        }
      }
    }

    return questions;
  }

  private async validateAnswers(
    nationalId: string,
    answers: Record<string, string>
  ): Promise<boolean> {
    // Extract person IDs from question keys
    const personIds: number[] = [];
    const questionMetadata: Array<{
      key: string;
      personId: number;
      field: string;
    }> = [];

    for (const key of Object.keys(answers)) {
      // Parse key format: type_index_personId_field
      // Examples: "son_0_410519953_nid", "daughter_1_410519946_bd", "spouse_410519979_nid", "personal_410031934_bd"

      let personId: number;
      let field: string;

      if (key.startsWith("son_") || key.startsWith("daughter_")) {
        // Format: son_0_410519953_nid or daughter_1_410519946_bd
        const parts = key.split("_");
        personId = parseInt(parts[2]);
        field = parts[3];
      } else if (key.startsWith("spouse_")) {
        // Format: spouse_410519979_nid or spouse_410519979_bd
        const parts = key.split("_");
        personId = parseInt(parts[1]);
        field = parts[2];
      } else if (key.startsWith("personal_")) {
        // Format: personal_410031934_bd
        const parts = key.split("_");
        personId = parseInt(parts[1]);
        field = parts[2];
      } else if (key.startsWith("father_")) {
        // Format: father_410031234_nid or father_410031234_bd
        const parts = key.split("_");
        personId = parseInt(parts[1]);
        field = parts[2];
      } else if (key.startsWith("mother_")) {
        // Format: mother_410031567_nid or mother_410031567_bd
        const parts = key.split("_");
        personId = parseInt(parts[1]);
        field = parts[2];
      } else {
        // Invalid key format
        return false;
      }

      if (isNaN(personId)) {
        return false;
      }

      personIds.push(personId);
      questionMetadata.push({ key, personId, field });
    }

    // Fetch all persons we need to validate against
    const persons = await this.prisma.person.findMany({
      where: { id: { in: personIds } },
    }); //as Array<{ id: number; national_id: string; birthDate?: string }>;

    // Create a map for quick lookup
    const personMap = new Map(persons.map((p) => [p.id, p]));

    // Validate each answer
    for (const questionMeta of questionMetadata) {
      const userAnswer = answers[questionMeta.key]?.trim();

      if (!userAnswer) {
        return false;
      }

      const person = personMap.get(questionMeta.personId);
      if (!person) {
        return false;
      }

      // Validate based on field type
      if (questionMeta.field === "nid") {
        // Compare national IDs
        const personNationalId = person.national_id?.toString();
        if (personNationalId !== userAnswer) {
          return false;
        }
      } else if (questionMeta.field === "bd") {
        // Compare birth dates (exact match)
        if (person.birthDate?.trim() !== userAnswer) {
          return false;
        }
      } else {
        // Unknown field type
        return false;
      }
    }

    return true;
  }

  private getRelativesByCode(relations: any[], code: string) {
    return relations.filter(
      (r) => r.relationCode?.nameEn?.toLowerCase() === code.toLowerCase()
    );
  }

  private selectRandomQuestions(
    questions: VerificationQuestion[],
    count: number
  ): VerificationQuestion[] {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  async signIn(dto: SigninDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { ...baseUserSelect, password: true },
    });
    if (!user) throw new UnauthorizedException("Invalid credentials");
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException("Invalid credentials");

    const token = await this.jwtService.signAsync({
      sub: user.id,
      type: "user",
      email: user.email,
      role: user.role,
    });
    const { password, ...safeUser } = user as any;
    return { access_token: token, user: safeUser };
  }

  // async resetPasswordRequest(email: string) {
  //   const user = await this.prisma.user.findUnique({
  //     where: { email },
  //     select: { id: true, email: true, name: true },
  //   });

  //   if (!user) {
  //     throw new UnauthorizedException("البريد الإلكتروني غير موجود");
  //   }

  //   // Generate reset token (valid for 1 hour)
  //   const resetToken = this.jwtService.sign(
  //     { sub: user.id, type: "password-reset" },
  //     { expiresIn: "1h" }
  //   );

  //   // Store reset token in database (hashed)
  //   const hashedToken = await bcrypt.hash(resetToken, 10);
  //   await this.prisma.user.update({
  //     where: { id: user.id },
  //     data: { resetToken: hashedToken, resetTokenExpiry: new Date(Date.now() + 3600000) },
  //   });

  //   return {
  //     success: true,
  //     message: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
  //     resetToken, // In production, send via email instead
  //   };
  // }

  // async resetPassword(resetToken: string, newPassword: string) {
  //   // Verify token
  //   try {
  //     this.jwtService.verify(resetToken);
  //   } catch {
  //     throw new UnauthorizedException("رابط إعادة التعيين غير صالح أو منتهي الصلاحية");
  //   }

  //   // Find user with valid reset token
  //   const users = await this.prisma.user.findMany({
  //     where: {
  //       resetTokenExpiry: { gt: new Date() },
  //     },
  //     select: { id: true, resetToken: true },
  //   });

  //   let validUser = null;
  //   for (const user of users) {
  //     const isValid = await bcrypt.compare(resetToken, user.resetToken || "");
  //     if (isValid) {
  //       validUser = user;
  //       break;
  //     }
  //   }

  //   if (!validUser) {
  //     throw new UnauthorizedException("رابط إعادة التعيين غير صالح");
  //   }

  //   // Hash new password and update
  //   const hashedPassword = await bcrypt.hash(newPassword, 10);
  //   await this.prisma.user.update({
  //     where: { id: validUser.id },
  //     data: {
  //       password: hashedPassword,
  //       resetToken: null,
  //       resetTokenExpiry: null,
  //     },
  //   });

  //   return {
  //     success: true,
  //     message: "تم تحديث كلمة المرور بنجاح",
  //   };
  // }

  async changePassword(
    dto: ChangePasswordDto,
    userId: number,
    userType: "citizen" | "user" | null
  ) {
    let user;
    if (userType === "citizen") {
      user = await this.prisma.citizen.findUnique({
        where: { id: userId },
        select: { id: true, password: true },
      });
    } else if (userType === "user") {
      user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, password: true },
      });
    }

    if (!user) {
      throw new UnauthorizedException("المستخدم غير موجود");
    }

    if (!user.password) {
      throw new UnauthorizedException("التسجيل غير مكتمل");
    }

    // Verify old password
    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException("كلمة المرور القديمة غير صحيحة");
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    if (userType === "citizen") {
      await this.prisma.citizen.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    } else if (userType === "user") {
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    }

    return {
      success: true,
      message: "تم تغيير كلمة المرور بنجاح",
    };
  }
}
