import { Module } from "@nestjs/common";
import { ApplicationsService } from "./applications.service";
import { DatabaseModule } from "../database/database.module";
import { SupabaseService } from "src/common/services";
import { StorageService } from "../storage/storage.service";
import { AdminApplicationsController } from "./controllers/admin-applications.controller copy";
import { CitizenApplicationsController } from "./controllers/citizen-applications.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [AdminApplicationsController,CitizenApplicationsController],
  providers: [SupabaseService, ApplicationsService,StorageService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
