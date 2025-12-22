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
} from "@nestjs/common";
import { RolesGuard } from "src/common/guards/roles.guard";
import { User } from "src/common/decorators/user.decorator";
import { MaybeSupervisor } from "src/common/decorators/maybe-supervisor.decorator";
import { Response } from "express";
import { UserRole } from "@prisma/client";
import { CitizensService } from "../citizens.service";
import { CreateCitizenDto } from "../dto/create-citizen.dto";
import { UpdateCitizenDto } from "../dto/update-citizen.dto";
import {
  ADMIN_CITIZENS_ROUTE_PREFIX,
  CITIZEN_ID_PARAM,
  ROUTES,
} from "src/common/constats/routes.constants";
@Controller(ADMIN_CITIZENS_ROUTE_PREFIX)
export class AdminCitizensController {
  constructor(private svc: CitizensService) {}

  @Post()
  @UseGuards(RolesGuard(UserRole.ADMIN))
  create(@Body() dto: CreateCitizenDto) {
    return this.svc.create(dto);
  }

  @Get()
  @UseGuards(RolesGuard(UserRole.ADMIN, UserRole.SUPERVISOR))
  findAll(@User() user, @MaybeSupervisor() sup?: any) {
    const effectiveUser = sup ?? user;
    return this.svc.findAll(effectiveUser);
  }

  @Get(ROUTES.ADMIN.ACTIONS.EXPORT)
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async exportCitizens(@Res() res: Response) {
    await this.svc.exportCitizens(res);
  }

  @Get(`:${CITIZEN_ID_PARAM}`)
  @UseGuards(RolesGuard(UserRole.ADMIN, UserRole.SUPERVISOR))
  findOne(
    @Param(CITIZEN_ID_PARAM, ParseIntPipe) id: number,
    @User() user,
    @MaybeSupervisor() sup?: any
  ) {
    const effectiveUser = sup ?? user;
    return this.svc.findOne(id, effectiveUser);
  }

  @Patch(`:${CITIZEN_ID_PARAM}`)
  @UseGuards(RolesGuard(UserRole.ADMIN))
  update(
    @Param(CITIZEN_ID_PARAM, ParseIntPipe) id: number,
    @Body() dto: UpdateCitizenDto,
    @User() user
  ) {
    return this.svc.update(id, dto, user);
  }

  @Delete(`:${CITIZEN_ID_PARAM}`)
  @UseGuards(RolesGuard(UserRole.ADMIN))
  remove(@Param(CITIZEN_ID_PARAM, ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
