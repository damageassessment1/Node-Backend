import { AccountStatus, AccountType } from '@prisma/client';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  Length,
} from 'class-validator';


export class CreateBankAccountDto {
  @IsString()
  @IsNotEmpty()
  citizenId: number

  @IsString()
  @IsNotEmpty()
  bankId: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  accountHolderName: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 30)
  accountNumber: string;

  @IsString()
  @IsOptional()
  @Length(15, 34)
  iban?: string;

  @IsEnum(AccountType)
  accountType: AccountType;

  @IsString()
  @IsNotEmpty()
  @Length(3, 3) // ISO currency code (USD, EUR, etc.)
  currency: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}


export class UpdateBankAccountDto {

  @IsString()
  @IsNotEmpty()
  citizenId: number


  @IsString()
  @IsOptional()
  @Length(2, 100)
  accountHolderName?: string;

  @IsString()
  @IsOptional()
  @Length(6, 30)
  accountNumber?: string;

  @IsString()
  @IsOptional()
  @Length(15, 34)
  iban?: string;

  @IsEnum(AccountType)
  @IsOptional()
  accountType?: AccountType;

  @IsString()
  @IsOptional()
  @Length(3, 3)
  currency?: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @IsEnum(AccountStatus)
  @IsOptional()
  status?: AccountStatus;
}


export class DeleteAccountDto{
  @IsString()
  @IsNotEmpty()
  citizenId: number
}
