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

@Controller("locations")
export class LocationsController {
  constructor(private readonly svc: LocationsService) {}

  @Post()
  @UseGuards(RolesGuard("admin"))
  create(@Body() dto: CreateLocationDto, @User() user: any) {
    return this.svc.create(dto as any, user);
  }

  @Get()
  @UseGuards(RolesGuard("admin", "supervisor"))
  findAll(@User() user: any) {
    return this.svc.findAll(user);
  }

  @Get(":id")
  @UseGuards(RolesGuard("admin", "supervisor"))
  findOne(@Param("id") id: string, @User() user: any) {
    return this.svc.findOne(Number(id), user);
  }

  @Patch(":id")
  @UseGuards(RolesGuard("admin"))
  update(
    @Param("id") id: string,
    @Body() dto: UpdateLocationDto,
    @User() user: any
  ) {
    return this.svc.update(Number(id), dto, user);
  }

  @Delete(":id")
  @UseGuards(RolesGuard("admin"))
  remove(@Param("id") id: string, @User() user: any) {
    return this.svc.remove(Number(id), user);
  }
}
