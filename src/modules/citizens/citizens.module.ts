import { Module } from '@nestjs/common';
import { CitizensService } from './citizens.service';
import { DatabaseModule } from '../database/database.module';
import { AdminCitizensController } from './controllers/admin-citizens.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminCitizensController],
  providers: [CitizensService],
  exports: [CitizensService],
})
export class CitizensModule {}
