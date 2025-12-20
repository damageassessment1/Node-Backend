import { Module } from "@nestjs/common";
import { ApplicationsService } from "./applications.service";
import { ApplicationsController } from "./applications.controller";
import { DatabaseModule } from "../database/database.module";
import { SupabaseService } from "src/common/services";
import { StorageService } from "../storage/storage.service";

@Module({
  imports: [DatabaseModule],
  controllers: [ApplicationsController],
  providers: [SupabaseService, ApplicationsService,StorageService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
