import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Citizen, User, UserRole } from "@prisma/client";
import { CreateBankAccountDto, UpdateBankAccountDto } from "./dto/bank.dto";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class BanksService {
  constructor(private prisma: PrismaService) {}

 
  async getAllBanks() {
    return this.prisma.bank.findMany({
      orderBy: { enName: "asc" },
    });
  }

 
  async addBankAccount(dto: CreateBankAccountDto, citizen: Citizen) {
    // verify bank exists
    const bank = await this.prisma.bank.findUnique({
      where: { id: dto.bankId },
    });

    if (!bank) {
      throw new NotFoundException("Bank not found");
    }

    // ensure only one primary account
    if (dto.isPrimary) {
      await this.prisma.citizenBankAccount.updateMany({
        where: { citizenId: citizen.id },
        data: { isPrimary: false },
      });
    }

    return this.prisma.citizenBankAccount.create({
      data: {
        citizenId: citizen.id,
        bankId: dto.bankId,
        accountHolderName: dto.accountHolderName,
        accountNumber: dto.accountNumber, // encrypt here
        iban: dto.iban,
        accountType: dto.accountType,
        currency: dto.currency,
        isPrimary: dto.isPrimary ?? false,
      },
    });
  }

 
  async getCitizenBankAccounts(citizenId: number, user: User) {
    if (
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.SUPERVISOR
    ) {
      throw new ForbiddenException();
    }

    return this.prisma.citizenBankAccount.findMany({
      where: { citizenId },
      include: {
        bank: {
          select: {
            id: true,
            enName: true,
            arName: true,
            swiftCode: true,
          },
        },
      },
    });
  }

  
  async updateBankAccount(
    citizenId: number,
    accountId: string,
    dto: UpdateBankAccountDto,
    user: User,
  ) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }

    const account = await this.prisma.citizenBankAccount.findFirst({
      where: { id: accountId, citizenId },
    });

    if (!account) {
      throw new NotFoundException("Bank account not found");
    }

    if (dto.isPrimary) {
      await this.prisma.citizenBankAccount.updateMany({
        where: { citizenId },
        data: { isPrimary: false },
      });
    }

    return this.prisma.citizenBankAccount.update({
      where: { id: accountId },
      data: {
        accountHolderName: dto.accountHolderName,
        accountNumber: dto.accountNumber,
        iban: dto.iban,
        accountType: dto.accountType,
        currency: dto.currency,
        isPrimary: dto.isPrimary,
        status: dto.status,
      },
    });
  }

  
  async deleteBankAccount(
    citizenId: number,
    accountId: string,
    user: User,
  ) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }

    const account = await this.prisma.citizenBankAccount.findFirst({
      where: { id: accountId, citizenId },
    });

    if (!account) {
      throw new NotFoundException("Bank account not found");
    }

    return this.prisma.citizenBankAccount.delete({
      where: { id: accountId },
    });
  }
}
