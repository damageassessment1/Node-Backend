import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BanksService } from './banks.service';
import { BanksController } from './controllers/banks.controller';
import { BankAccountsController } from './controllers/bank-accounts.contoller';

@Module({
  imports: [DatabaseModule],
  controllers: [BankAccountsController ,BanksController],
  providers: [BanksService],
})
export class BanksModule {}
