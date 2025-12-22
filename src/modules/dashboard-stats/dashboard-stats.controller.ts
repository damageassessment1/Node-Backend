import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { RolesGuard } from "src/common/guards/roles.guard";
import { UserRole } from "@prisma/client";
import { User } from "src/common/decorators/user.decorator";
import { Public } from "src/common/decorators/public-endpoint.decorator";
import { DashboardStatsService } from "./dashboard-stats.service";

@Controller("stats")
export class DashboardStatsController {
  constructor(private readonly service: DashboardStatsService) {}
  
  @Get("/admin-dashboard")
  @UseGuards(RolesGuard(UserRole.ADMIN))
  getAdminData(@User() user) {
    return this.service.getAdminData(user);
  }

  @Get("/supervisor-dashboard")
  @UseGuards(RolesGuard(UserRole.SUPERVISOR))
  getSupervisorData(@User() user) {
    return this.service.getSupervisorData(user);
  }

}
