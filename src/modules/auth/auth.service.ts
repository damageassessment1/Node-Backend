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
import { SigninDto } from "./dto";
import { baseUserSelect } from "src/common/prisma/selects";
import { PrismaService } from "../database/prisma.service";
import { VerificationStatus } from "@prisma/client";
import { generateApplicationId } from "src/common/utils";

export interface VerificationQuestion {
  key: string;
  question: string;
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
      citizen.verification_status === VerificationStatus.questions_verified &&
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
        verification_status: VerificationStatus.national_id_verified,
      },
    });

    return {
      success: true,
      message: "تم التحقق من الأسئلة الأمنية بنجاح. يمكنك الآن إكمال التسجيل.",
    };
  }

  async completeCitizenSignup(national_id: string, password: string) {
    const citizen = await this.prisma.citizen.findUnique({
      where: { national_id },
    });

    if (!citizen) {
      throw new UnauthorizedException("المواطن غير موجود");
    }

    if (
      citizen.verification_status !== VerificationStatus.national_id_verified
    ) {
      throw new ForbiddenException("يجب إكمال التحقق من الهوية قبل التسجيل");
    }

    const hashed = await bcrypt.hash(password, 10);

    const updated = await this.prisma.citizen.update({
      where: { national_id },
      data: {
        password: hashed,
        verification_status: VerificationStatus.questions_verified,
      },
    });

    
    const application = await this.prisma.application.create({
      data: { id: generateApplicationId(), citizenId: updated.id },
    });

    const { password: secret, ...safeCitizen } = updated;

    const token = this.jwtService.sign({
      sub: updated.id,
      national_id: updated.national_id,
      type: "citizen",
    });

    return {
      success: true,
      message: "تم إكمال التسجيل بنجاح",
      user: safeCitizen,
      application,
      token,
    };
  }

  async citizenLogin(national_id: string, password: string) {
    // 1. Find citizen
    const citizen = await this.prisma.citizen.findUnique({
      where: { national_id },
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

    const { password: secret, ...safeCitizen } = citizen;

    return {
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      user: safeCitizen,
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
        citizen.verification_status === VerificationStatus.questions_verified &&
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
              verification_status: VerificationStatus.national_id_verified,
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

    // Get all children (both sons and daughters have relation code "Son")
    const children = this.getRelativesByCode(relations, "Son");
    const sons = children.filter(
      (rel) => rel.relativePerson?.sexCode === "ذكر"
    );
    const daughters = children.filter(
      (rel) => rel.relativePerson?.sexCode === "أنثى"
    );
    const spouse = this.getRelativesByCode(relations, "Spouse");

    // Questions about sons - National ID and Birth Date only
    sons.forEach((rel, index) => {
      const son = rel.relativePerson;
      if (son?.firstName) {
        // Son's national ID
        questions.push({
          key: `son_${index}_${son.id}_nid`,
          question: `ما هو الرقم الوطني لابنك ${son.firstName}؟`,
        });

        // Son's birth date
        if (son.birthDate) {
          questions.push({
            key: `son_${index}_${son.id}_bd`,
            question: `ما هو تاريخ ميلاد ابنك ${son.firstName}؟ (يوم/شهر/سنة)`,
          });
        }
      }
    });

    // Questions about daughters - National ID and Birth Date only
    daughters.forEach((rel, index) => {
      const daughter = rel.relativePerson;
      if (daughter?.firstName) {
        // Daughter's national ID
        questions.push({
          key: `daughter_${index}_${daughter.id}_nid`,
          question: `ما هو الرقم الوطني لابنتك ${daughter.firstName}؟`,
        });

        // Daughter's birth date
        if (daughter.birthDate) {
          questions.push({
            key: `daughter_${index}_${daughter.id}_bd`,
            question: `ما هو تاريخ ميلاد ابنتك ${daughter.firstName}؟ (يوم/شهر/سنة)`,
          });
        }
      }
    });

    // Questions about spouse - National ID and Birth Date only
    if (spouse.length > 0) {
      const spouseData = spouse[0].relativePerson;

      if (spouseData) {
        // Spouse's national ID
        questions.push({
          key: `spouse_${spouseData.id}_nid`,
          question: `ما هو الرقم الوطني ${spouseData.sexCode === "أنثى" ? "لزوجتك" : "لزوجك"}؟ `,
        });

        // Spouse's birth date
        if (spouseData.birthDate) {
          questions.push({
            key: `spouse_${spouseData.id}_bd`,
            question: `ما هو تاريخ ميلاد ${spouseData.sexCode === "أنثى" ? "لزوجتك" : "لزوجك"}؟ (يوم/شهر/سنة)`,
          });
        }
      }
    }

    // Personal questions - Birth Date only (they already know their own national ID)
    if (person.birthDate) {
      questions.push({
        key: `personal_${person.id}_bd`,
        question: `ما هو تاريخ ميلادك؟ (يوم/شهر/سنة)`,
      });
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
    });

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
}
