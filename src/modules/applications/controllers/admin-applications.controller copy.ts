import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { RolesGuard } from "src/common/guards/roles.guard";
import { User } from "src/common/decorators/user.decorator";
import { UserRole } from "@prisma/client";
import { Response } from "express";
import { ApplicationsService } from "../applications.service";
import { CreateApplicationDto, UpdateApplicationDto } from "../dto";
import {
  ADMIN_APPLICATIONS_ROUTE_PREFIX,
  ADMIN_ROUTES,
  APPLICATION_ID_PARAM,
} from "src/common/constats/routes.constants";

@Controller(ADMIN_APPLICATIONS_ROUTE_PREFIX)
export class AdminApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Post()
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async create(@Body() dto: CreateApplicationDto, @User() user: any) {
    return this.service.create(dto, user);
  }

  @Get()
  @UseGuards(RolesGuard(UserRole.ADMIN, UserRole.SUPERVISOR))
  async findAll(@User() user: any) {
    return this.service.findAll(user);
  }

  @Get(ADMIN_ROUTES.APPLICATIONS_EXPORT)
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async exportApplications(@Res() res: Response) {
    await this.service.exportApplications(res);
  }

  @Get(`:${APPLICATION_ID_PARAM}`)
  @UseGuards(RolesGuard(UserRole.ADMIN, UserRole.SUPERVISOR))
  async findOne(@Param(APPLICATION_ID_PARAM) id: string, @User() user: any) {
    return this.service.findOne(id, user);
  }

  @Patch(`:${APPLICATION_ID_PARAM}`)
  @UseGuards(RolesGuard(UserRole.ADMIN, UserRole.SUPERVISOR))
  async update(
    @Param(APPLICATION_ID_PARAM) id: string,
    @Body() dto: UpdateApplicationDto,
    @User() user: any
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(`:${APPLICATION_ID_PARAM}`)
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async remove(@Param(APPLICATION_ID_PARAM) id: string, @User() user: any) {
    return this.service.remove(id, user);
  }
}
