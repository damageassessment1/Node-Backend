import {
    Injectable,
    UnauthorizedException,
    ForbiddenException,
    HttpException,
    HttpStatus,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { VerificationStatus, Prisma } from "@prisma/client";

export interface VerificationQuestion {
    key: string;
    question: string;
    en_question: string;
}

@Injectable()
export class CitizenVerificationService {
    constructor(private prisma: PrismaService) { }

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
            let personId: number;
            let field: string;

            if (key.startsWith("son_") || key.startsWith("daughter_")) {
                const parts = key.split("_");
                personId = parseInt(parts[2]);
                field = parts[3];
            } else if (key.startsWith("spouse_")) {
                const parts = key.split("_");
                personId = parseInt(parts[1]);
                field = parts[2];
            } else if (key.startsWith("personal_")) {
                const parts = key.split("_");
                personId = parseInt(parts[1]);
                field = parts[2];
            } else if (key.startsWith("father_")) {
                const parts = key.split("_");
                personId = parseInt(parts[1]);
                field = parts[2];
            } else if (key.startsWith("mother_")) {
                const parts = key.split("_");
                personId = parseInt(parts[1]);
                field = parts[2];
            } else {
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
                const personNationalId = person.national_id?.toString();
                if (personNationalId !== userAnswer) {
                    return false;
                }
            } else if (questionMeta.field === "bd") {
                if (person.birthDate?.trim() !== userAnswer) {
                    return false;
                }
            } else {
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
}
