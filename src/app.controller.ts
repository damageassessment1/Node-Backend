import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { User } from "./common/decorators/user.decorator";
import { AppService } from "./app.service";
import { RolesGuard } from "./common/guards/roles.guard";
import { Public } from "./common/decorators/public-endpoint.decorator";

@Controller("")
export class AppController {
  constructor(private readonly service: AppService) {}
  @Get("/admin-dashboard")
  @UseGuards(RolesGuard("admin"))
  getAdminData(@User() user) {
    return this.service.getAdminData(user);
  }

  @Get("/supervisor-dashboard")
  @UseGuards(RolesGuard("supervisor"))
  getSupervisorData(@User() user) {
    return this.service.getSupervisorData(user);
  }

  @Get("/keep-alive")
  @Public()
  keepAlive() {
    return "Server is running";
  }

  @Get("/track-application/:id")
  @Public()
  async findApplicationById(@Param("id") id: string) {
    return this.service.findApplicationById(id);
  }
}
