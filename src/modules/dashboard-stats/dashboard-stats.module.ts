import { Module } from "@nestjs/common";
import { DashboardStatsController } from "./dashboard-stats.controller";
import { DashboardStatsService } from "./dashboard-stats.service";
import { DatabaseModule } from "../database/database.module";

@Module({
  imports: [DatabaseModule],
  providers: [DashboardStatsService],
  controllers: [DashboardStatsController],
})
export class DashboardStatsModule {}
