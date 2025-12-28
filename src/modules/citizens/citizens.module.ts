import { Module } from '@nestjs/common';
import { CitizensService } from './citizens.service';
import { DatabaseModule } from '../database/database.module';
import { AdminCitizensController } from './controllers/admin-citizens.controller';
import { CitizensController } from './controllers/citizens.controller';
import { SupabaseService } from 'src/common/services';
import { StorageService } from '../storage/storage.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminCitizensController,CitizensController],
  providers: [SupabaseService,CitizensService,StorageService],
  exports: [CitizensService],
})
export class CitizensModule {}
