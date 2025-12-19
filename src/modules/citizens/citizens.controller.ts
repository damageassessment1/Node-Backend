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
  Query,
  Res,
} from "@nestjs/common";
import { CitizensService } from "./citizens.service";
import { CreateCitizenDto } from "./dto/create-citizen.dto";
import { UpdateCitizenDto } from "./dto/update-citizen.dto";
import { RolesGuard } from "src/common/guards/roles.guard";
import { User } from "src/common/decorators/user.decorator";
import { MaybeSupervisor } from "src/common/decorators/maybe-supervisor.decorator";
import { CreateLocationDto } from "./dto/create-location.dto";
import { Response } from "express";
import { UserRole } from "@prisma/client";
@Controller("citizens")
export class CitizensController {
  constructor(private svc: CitizensService) {}

  @Post()
  @UseGuards(RolesGuard(UserRole.ADMIN))
  create(@Body() dto: CreateCitizenDto) {
    return this.svc.create(dto);
  }

  @Get() 
  @UseGuards(RolesGuard(UserRole.ADMIN,UserRole.SUPERVISOR))
  findAll(@User() user, @MaybeSupervisor() sup?: any) {
    const effectiveUser = sup ?? user;
    return this.svc.findAll(effectiveUser);
  }

  @Get("export-citizens")
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async exportCitizens(@Res() res: Response) {
    await this.svc.exportCitizens(res);
  }

  @Get(":id")
  @UseGuards(RolesGuard(UserRole.ADMIN,UserRole.SUPERVISOR))
  findOne(
    @Param("id", ParseIntPipe) id: number,
    @User() user,
    @MaybeSupervisor() sup?: any
  ) {
    const effectiveUser = sup ?? user;
    return this.svc.findOne(id, effectiveUser);
  }

  @Patch(":id")
  @UseGuards(RolesGuard(UserRole.ADMIN))
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateCitizenDto,
    @User() user
  ) {
    return this.svc.update(id, dto, user);
  }

  @Delete(":id")
  @UseGuards(RolesGuard(UserRole.ADMIN))
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }

  @Post(":id/locations")
  @UseGuards(RolesGuard(UserRole.ADMIN))
  createLocation(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: CreateLocationDto
  ) {
    return this.svc.createLocation(id, dto);
  }
}
