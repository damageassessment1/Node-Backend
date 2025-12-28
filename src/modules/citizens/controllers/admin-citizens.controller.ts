import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  Res,
  Query,
} from "@nestjs/common";
import { User } from "src/common/decorators/user.decorator";
import { MaybeSupervisor } from "src/common/decorators/maybe-supervisor.decorator";
import { Response } from "express";
import { CitizensService } from "../citizens.service";
import { CreateCitizenDto } from "../dto/create-citizen.dto";
import { UpdateCitizenDto } from "../dto/update-citizen.dto";
import {
  ADMIN_CITIZENS_ROUTE_PREFIX,
  CITIZEN_ID_PARAM,
  ROUTES,
} from "src/common/constats/routes.constants";
import { permissions } from "src/common/constats/permissions.constants";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequirePermissions } from "src/common/decorators/requir-permission.decorator";
import { User as UserType } from "@prisma/client";
@Controller(ADMIN_CITIZENS_ROUTE_PREFIX)
export class AdminCitizensController {
  constructor(private svc: CitizensService) {}

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.citizen.create)
  @Post()
  create(@Body() dto: CreateCitizenDto) {
    return this.svc.create(dto);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.citizen.view)
  @Get()
  findAll(
    @Query('page') page = "1",
    @Query('limit') limit = "10",
    @Query('fullName') fullName?: string,
    @Query('nationalId') nationalId?: string,
    @Query('phone') phone?: string
  ) {
    return this.svc.findAll(+page, +limit, { fullName, nationalId, phone });
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.citizen.export)
  @Get(ROUTES.ADMIN.ACTIONS.EXPORT)
  async exportCitizens(@Res() res: Response) {
    await this.svc.exportCitizens(res);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.citizen.view)
  @Get(`:${CITIZEN_ID_PARAM}`)
  findOne(
    @Param(CITIZEN_ID_PARAM, ParseIntPipe) id: number,
    @User() user,
    @MaybeSupervisor() sup?: any
  ) {
    const effectiveUser = sup ?? user;
    return this.svc.findOne(id, effectiveUser);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.citizen.update)
  @Patch(`:${CITIZEN_ID_PARAM}`)
  update(
    @Param(CITIZEN_ID_PARAM, ParseIntPipe) id: number,
    @Body() dto: UpdateCitizenDto,
    @User() user
  ) {
    return this.svc.update(id, dto, user);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.citizen.delete)
  @Delete(`:${CITIZEN_ID_PARAM}`)
  remove(@Param(CITIZEN_ID_PARAM, ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
