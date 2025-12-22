import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BanksService } from './banks.service';
import {  CitizenBankAccountsController } from './controllers/citizen-bank-accounts.controller';
import { AdminBankAccountsController } from './controllers/admin-bank-accounts.contoller';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminBankAccountsController ,CitizenBankAccountsController],
  providers: [BanksService],
})
export class BanksModule {}
