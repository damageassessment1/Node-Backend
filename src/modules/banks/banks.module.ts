import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BanksService } from './banks.service';
import { BanksController } from './banks.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [BanksController],
  providers: [BanksService],
})
export class BanksModule {}
