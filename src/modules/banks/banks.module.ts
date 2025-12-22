import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BanksService } from './banks.service';
import {  CitizenBankAccountsController } from './controllers/citizen-bank-accounts.controller';
import { AdminBankAccountsController } from './controllers/admin-bank-accounts.contoller';
import { BanksController } from './controllers/banks.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [BanksController ,AdminBankAccountsController ,CitizenBankAccountsController],
  providers: [BanksService],
})
export class BanksModule {}
