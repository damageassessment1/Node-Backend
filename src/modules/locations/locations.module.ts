import { Module } from "@nestjs/common";
import { LocationsService } from "./locations.service";
import { DatabaseModule } from "../database/database.module";
import { AdminLocationsController } from "./controllers/admin-locations.controller";
import { CitizenLocationsController } from "./controllers/citizen-locations.controller copy";
import { SupabaseService } from "src/common/services";
import { StorageService } from "../storage/storage.service";

@Module({
  imports: [DatabaseModule],
  controllers: [AdminLocationsController,CitizenLocationsController],
  providers: [SupabaseService, LocationsService,StorageService],
})
export class LocationsModule {}
