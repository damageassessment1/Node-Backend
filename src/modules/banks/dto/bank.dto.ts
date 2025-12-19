import { AccountStatus, AccountType } from '@prisma/client';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateBankAccountDto {
  bankId: string;
  accountHolderName: string;
  accountNumber: string;
  iban?: string;
  accountType: AccountType;
  currency: string;
  isPrimary?: boolean;
}

export class UpdateBankAccountDto {
  accountHolderName?: string;
  accountNumber?: string;
  iban?: string;
  accountType?: AccountType;
  currency?: string;
  isPrimary?: boolean;
  status?: AccountStatus;
}
