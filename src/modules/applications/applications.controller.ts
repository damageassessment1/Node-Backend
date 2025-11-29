import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApplicationsService } from "./applications.service";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UpdateApplicationDto } from "./dto/update-application.dto";
import { RolesGuard } from "src/common/guards/roles.guard";
import { User } from "src/common/decorators/user.decorator";
import { UpdateApplicationLocationDto } from "./dto/update-application-location.dto";

@Controller("applications")
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Post()
  @UseGuards(RolesGuard("admin"))
  async create(@Body() dto: CreateApplicationDto, @User() user: any) {
    return this.service.create(dto, user);
  }

  @Get()
  @UseGuards(RolesGuard("admin", "supervisor"))
  async findAll(@User() user: any) {
    return this.service.findAll(user);
  }

  @Get(":id")
  @UseGuards(RolesGuard("admin", "supervisor"))
  async findOne(@Param("id") id: string, @User() user: any) {
    return this.service.findOne(Number(id), user);
  }

  @Get(":id/location")
  @UseGuards(RolesGuard("admin", "supervisor"))
  async getLocation(@Param("id") id: string) {
    return this.service.getLocationByApplication(Number(id));
  }

  @Patch(":id")
  @UseGuards(RolesGuard("admin", "supervisor"))
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateApplicationDto,
    @User() user: any
  ) {
    return this.service.update(Number(id), dto, user);
  }

  @Delete(":id")
  @UseGuards(RolesGuard("admin"))
  async remove(@Param("id") id: string, @User() user: any) {
    return this.service.remove(Number(id), user);
  }

  @Patch(":id/location")
  @UseGuards(RolesGuard("admin", "supervisor"))
  async updateLocation(
    @Param("id") id: string,
    @Body() dto: UpdateApplicationLocationDto,
    @User() user: any
  ) {
    return this.service.updateLocationByApplication(Number(id), dto, user);
  }
}
