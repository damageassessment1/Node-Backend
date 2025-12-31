import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { User } from "src/common/decorators/user.decorator";
import { Response } from "express";
import { ApplicationsService } from "../applications.service";
import { CreateApplicationDto, UpdateApplicationDto } from "../dto";
import {
  ADMIN_APPLICATIONS_ROUTE_PREFIX,
  APPLICATION_ID_PARAM,
  ROUTES,
} from "src/common/constats/routes.constants";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequirePermissions } from "src/common/decorators/requir-permission.decorator";
import { permissions } from "src/common/constats/permissions.constants";
import { ApplicationQueryDto } from "../dto/application-query.dto";

@Controller(ADMIN_APPLICATIONS_ROUTE_PREFIX)
export class AdminApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.application.create)
  @Post()
  async create(@Body() dto: CreateApplicationDto, @User() user: any) {
    return this.service.create(dto, user);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.application.view)
  @Get()
  async findAll(
     @Query() query: ApplicationQueryDto,
  ) {
    return this.service.findAll(query);
  }
  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.application.export)
  @Get(ROUTES.ADMIN.ACTIONS.EXPORT)
  async exportApplications(@Res() res: Response) {
    await this.service.exportApplications(res);
  }
  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.application.view)
  @Get(`:${APPLICATION_ID_PARAM}`)
  async findOne(@Param(APPLICATION_ID_PARAM) id: string, @User() user: any) {
    return this.service.findOne(id, user);
  }
  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.application.update)
  @Patch(`:${APPLICATION_ID_PARAM}`)
  async update(
    @Param(APPLICATION_ID_PARAM) id: string,
    @Body() dto: UpdateApplicationDto,
    @User() user: any
  ) {
    return this.service.update(id, dto, user);
  }
  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.application.delete)
  @Delete(`:${APPLICATION_ID_PARAM}`)
  async remove(@Param(APPLICATION_ID_PARAM) id: string, @User() user: any) {
    return this.service.remove(id, user);
  }
}
