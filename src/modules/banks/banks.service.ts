import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Citizen } from "@prisma/client";
import { CreateBankAccountDto, UpdateBankAccountDto } from "./dto/bank.dto";
import { PrismaService } from "../database/prisma.service";
import { baseCitizenSelect } from "src/common/prisma/selects/citizen.select";
import * as ExcelJS from "exceljs";
import { Response } from "express";

@Injectable()
export class BanksService {
  constructor(private prisma: PrismaService) {}

  /* =========================
     BANKS
  ========================= */
  async getAllBanks() {
    return this.prisma.bank.findMany({
      orderBy: { enName: "asc" },
    });
  }


   /* =========================
     Get All Bank Accouts For All Citizens (Admin)
  ========================= */
  async getAllBankAcountsForCitizens() {
    return this.prisma.citizenBankAccount.findMany({
      orderBy: { id: "asc" },
      include: { bank: true, citizen: { select: baseCitizenSelect } },
    });
  }

  /* =========================
     CITIZEN (SELF)
  ========================= */
  async createMyBankAccount(dto: CreateBankAccountDto, citizen: Citizen) {
    await this.ensureBankExists(dto.bankId);
    await this.ensureNoDuplicateBankAccount(citizen.id,dto.bankId)

    if (dto.isPrimary) {
      await this.clearPrimaryAccount(citizen.id);
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

  /* =========================
     ADMIN (CITIZEN SCOPED)
  ========================= */
  async createBankAccountForCitizen(
    dto: CreateBankAccountDto
  ) {
    await this.ensureCitizenExists(dto.citizenId);
    await this.ensureBankExists(dto.bankId);

    await this.ensureNoDuplicateBankAccount(dto.citizenId,dto.bankId)

    if (dto.isPrimary) {
      await this.clearPrimaryAccount(dto.citizenId);
    }

    return this.prisma.citizenBankAccount.create({
      data: {
        citizenId:dto.citizenId,
        bankId: dto.bankId,
        accountHolderName: dto.accountHolderName,
        accountNumber: dto.accountNumber,
        iban: dto.iban,
        accountType: dto.accountType,
        currency: dto.currency,
        isPrimary: dto.isPrimary ?? false,
      },
      include: {
        bank: true,
        citizen: { select: baseCitizenSelect },
      },
    });
  }

  async getMyBankAccounts(citizen: Citizen) {
    return this.prisma.citizenBankAccount.findMany({
      where: { citizenId: citizen.id },
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
    accountId: string,
    dto: UpdateBankAccountDto
  ) {
    const account = await this.findCitizenAccountOrFail(dto.citizenId, accountId);

    if (dto.isPrimary) {
      await this.clearPrimaryAccount(dto.citizenId);
    }

    return this.prisma.citizenBankAccount.update({
      where: { id: account.id },
      data: {
        accountHolderName: dto.accountHolderName,
        accountNumber: dto.accountNumber,
        iban: dto.iban,
        accountType: dto.accountType,
        currency: dto.currency,
        isPrimary: dto.isPrimary,
        status: dto.status,
      },
      include: {
        bank: true,
        citizen: { select: baseCitizenSelect },
      },
    });
  }

  async deleteBankAccount(citizenId: number, accountId: string) {
    await this.findCitizenAccountOrFail(citizenId, accountId);

    return this.prisma.citizenBankAccount.delete({
      where: { id: accountId },
    });
  }

  /* =========================
     ADMIN EXPORT
  ========================= */
  async exportBankAccounts(res: Response) {
    const accounts = await this.prisma.citizenBankAccount.findMany({
      include: {
        citizen: true,
        bank: true,
      },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Bank Accounts");

    sheet.columns = [
      { header: "Account ID", key: "id", width: 30 },
      { header: "Citizen ID", key: "citizenId", width: 15 },
      { header: "Citizen Name", key: "citizenName", width: 30 },

      { header: "Bank (EN)", key: "bankEn", width: 25 },
      { header: "Bank (AR)", key: "bankAr", width: 25 },
      { header: "SWIFT Code", key: "swift", width: 20 },
      { header: "Country", key: "country", width: 20 },

      { header: "Account Holder Name", key: "holder", width: 30 },
      { header: "Account Number", key: "accountNumber", width: 25 },
      { header: "IBAN", key: "iban", width: 30 },

      { header: "Account Type", key: "type", width: 20 },
      { header: "Currency", key: "currency", width: 10 },
      { header: "Primary", key: "primary", width: 10 },
      { header: "Status", key: "status", width: 15 },

      { header: "Created At", key: "createdAt", width: 20 },
    ];

    accounts.forEach((acc) => {
      sheet.addRow({
        id: acc.id,
        citizenId: acc.citizenId,
        citizenName: acc.citizen?.full_name,

        bankEn: acc.bank?.enName,
        bankAr: acc.bank?.arName,
        swift: acc.bank?.swiftCode,
        country: acc.bank?.country,

        holder: acc.accountHolderName,
        accountNumber: acc.accountNumber,
        iban: acc.iban,

        type: acc.accountType,
        currency: acc.currency,
        primary: acc.isPrimary ? "YES" : "NO",
        status: acc.status,

        createdAt: acc.createdAt.toLocaleString(),
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=bank-accounts.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  /* =========================
     PRIVATE HELPERS
  ========================= */
  private async ensureCitizenExists(citizenId: number) {
    const citizen = await this.prisma.citizen.findUnique({
      where: { id: citizenId },
    });

    if (!citizen) {
      throw new NotFoundException("Citizen not found");
    }
  }

  private async ensureBankExists(bankId: string) {
    const bank = await this.prisma.bank.findUnique({
      where: { id: bankId },
    });

    if (!bank) {
      throw new NotFoundException("Bank not found");
    }
  }

  private async clearPrimaryAccount(citizenId: number) {
    await this.prisma.citizenBankAccount.updateMany({
      where: { citizenId },
      data: { isPrimary: false },
    });
  }

  private async findCitizenAccountOrFail(citizenId: number, accountId: string) {
    const account = await this.prisma.citizenBankAccount.findFirst({
      where: { id: accountId, citizenId },
    });

    if (!account) {
      throw new NotFoundException("Bank account not found");
    }

    return account;
  }

  private async ensureNoDuplicateBankAccount(
  citizenId: number,
  bankId: string,
) {
  const exists = await this.prisma.citizenBankAccount.findFirst({
    where: {
      citizenId,
      bankId,
    },
  });

  if (exists) {
    throw new ForbiddenException(
      'Citizen already has an account in this bank',
    );
  }
}

}
