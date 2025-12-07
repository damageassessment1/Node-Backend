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
} from "@nestjs/common";
import { CitizensService } from "./citizens.service";
import { CreateCitizenDto } from "./dto/create-citizen.dto";
import { UpdateCitizenDto } from "./dto/update-citizen.dto";
import { RolesGuard } from "src/common/guards/roles.guard";
import { User } from "src/common/decorators/user.decorator";
import { MaybeSupervisor } from "src/common/decorators/maybe-supervisor.decorator";
import { CreateLocationDto } from "./dto/create-location.dto";

@Controller("citizens")
export class CitizensController {
  constructor(private svc: CitizensService) {}

  @Post()
  @UseGuards(RolesGuard("admin"))
  create(@Body() dto: CreateCitizenDto) {
    return this.svc.create(dto);
  }

  @Get()
  @UseGuards(RolesGuard("admin", "supervisor"))
  findAll(@User() user, @MaybeSupervisor() sup?: any) {
    const effectiveUser = sup ?? user;
    return this.svc.findAll(effectiveUser);
  }

  @Get(":id")
  @UseGuards(RolesGuard("admin", "supervisor"))
  findOne(
    @Param("id", ParseIntPipe) id: number,
    @User() user,
    @MaybeSupervisor() sup?: any
  ) {
    const effectiveUser = sup ?? user;
    return this.svc.findOne(id, effectiveUser);
  }

  @Patch(":id")
  @UseGuards(RolesGuard("admin"))
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateCitizenDto,
    @User() user
  ) {
    return this.svc.update(id, dto, user);
  }

  @Delete(":id")
  @UseGuards(RolesGuard("admin"))
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }

  @Post(":id/locations")
  @UseGuards(RolesGuard("admin"))
  createLocation(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: CreateLocationDto
  ) {
    return this.svc.createLocation(id, dto);
  }
}
