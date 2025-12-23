import { Module } from '@nestjs/common';
import { CitizensService } from './citizens.service';
import { DatabaseModule } from '../database/database.module';
import { AdminCitizensController } from './controllers/admin-citizens.controller';
import { CitizensController } from './controllers/citizens.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminCitizensController,CitizensController],
  providers: [CitizensService],
  exports: [CitizensService],
})
export class CitizensModule {}
