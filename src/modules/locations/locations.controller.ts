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
import { LocationsService } from "./locations.service";
import { RolesGuard } from "src/common/guards/roles.guard";
import { User } from "src/common/decorators/user.decorator";
import { CreateLocationDto } from "./dto/create-location.dto";
import { UpdateLocationDto } from "./dto/update-location.dto";
import { Citizen as CitizenType, UserRole } from "@prisma/client";

@Controller("locations")
export class LocationsController {
  constructor(private readonly svc: LocationsService) {}

  @Post()
  @UseGuards(RolesGuard(UserRole.ADMIN))
  create(@Body() dto: CreateLocationDto, @User() user: any) {
    return this.svc.create(dto, user);
  }

  @Get()
  @UseGuards(RolesGuard(UserRole.ADMIN,UserRole.SUPERVISOR))
  findAll(@User() user: any) {
    return this.svc.findAll(user);
  }

  @Get(":id")
  @UseGuards(RolesGuard(UserRole.ADMIN,UserRole.SUPERVISOR))
  findOne(@Param("id") id: string, @User() user: any) {
    return this.svc.findOne(Number(id), user);
  }

  @Patch(":id")
  @UseGuards(RolesGuard(UserRole.ADMIN))
  update(
    @Param("id") id: string,
    @Body() dto: UpdateLocationDto,
    @User() user: any
  ) {
    return this.svc.update(Number(id), dto, user);
  }

  @Delete(":id")
  @UseGuards(RolesGuard(UserRole.ADMIN))
  remove(@Param("id") id: string, @User() user: any) {
    return this.svc.remove(Number(id), user);
  }
}
