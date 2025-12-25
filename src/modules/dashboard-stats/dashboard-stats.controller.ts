import { Controller, Get, UseGuards } from "@nestjs/common";
import { User } from "src/common/decorators/user.decorator";
import { DashboardStatsService } from "./dashboard-stats.service";
import { STATS_ROUTES } from "src/common/constats/routes.constants";

@Controller(STATS_ROUTES.PREFIX)
export class DashboardStatsController {
  constructor(private readonly service: DashboardStatsService) {}
  
  @Get(STATS_ROUTES.ADMIN_DASHBOARD)
  getAdminData(@User() user) {
    return this.service.getAdminData(user);
  }

  @Get(STATS_ROUTES.SUPERVISOR_DASHBOARD)
  getSupervisorData(@User() user) {
    return this.service.getSupervisorData(user);
  }

}
