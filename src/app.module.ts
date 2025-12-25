import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { DatabaseModule } from "./modules/database/database.module";
import { UsersModule } from "./modules/users/users.module";
import { CitizensModule } from "./modules/citizens/citizens.module";
import { ApplicationsModule } from "./modules/applications/applications.module";
import { LocationsModule } from "./modules/locations/locations.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ScheduleModule } from "@nestjs/schedule";
import { HttpModule } from "@nestjs/axios";
import { KeepAliveService } from "./keep-alive.service";
import { BanksModule } from "./modules/banks/banks.module";
import { DashboardStatsModule } from "./modules/dashboard-stats/dashboard-stats.module";
import { PermissionsModule } from "./modules/permissions/permissions.module";
import { RolesModule } from "./modules/roles/roles.module";
// import { KeepAliveService } from "./keep-alive.service";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
    AuthModule,
    DatabaseModule,
    UsersModule,
    PermissionsModule,
    RolesModule,
    CitizensModule,
    ApplicationsModule,
    LocationsModule,
    BanksModule,
    DashboardStatsModule
  ],
  providers: [AppService,KeepAliveService],
  controllers: [AppController],
})
export class AppModule {}
