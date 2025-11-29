import { Module } from '@nestjs/common';
import { CitizensController } from './citizens.controller';
import { CitizensService } from './citizens.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CitizensController],
  providers: [CitizensService],
  exports: [CitizensService],
})
export class CitizensModule {}
