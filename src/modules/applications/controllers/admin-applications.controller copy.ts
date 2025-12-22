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

@Controller("admin/applications")
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


  @Get("export-applications")
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async exportApplications(@Res() res: Response) {
    await this.service.exportApplications(res);
  }

  @Get(":id")
  @UseGuards(RolesGuard(UserRole.ADMIN, UserRole.SUPERVISOR))
  async findOne(@Param("id") id: string, @User() user: any) {
    return this.service.findOne(id, user);
  }

 
  @Patch(":id")
  @UseGuards(RolesGuard(UserRole.ADMIN, UserRole.SUPERVISOR))
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateApplicationDto,
    @User() user: any
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(":id")
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async remove(@Param("id") id: string, @User() user: any) {
    return this.service.remove(id, user);
  }

  
}
