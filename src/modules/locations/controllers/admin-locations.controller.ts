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
import { LocationsService } from "../locations.service";
import { RolesGuard } from "src/common/guards/roles.guard";
import { User } from "src/common/decorators/user.decorator";
import { CreateLocationDto } from "../dto/create-location.dto";
import { UpdateLocationDto } from "../dto/update-location.dto";
import { UserRole } from "@prisma/client";
import {
  ADMIN_LOCATIONS_ROUTE_PREFIX,
  LOCATION_ID_PARAM,
} from "src/common/constats/routes.constants";

@Controller(ADMIN_LOCATIONS_ROUTE_PREFIX)
export class AdminLocationsController {
  constructor(private readonly svc: LocationsService) {}

  @Post()
  @UseGuards(RolesGuard(UserRole.ADMIN))
  create(@Body() dto: CreateLocationDto, @User() user: any) {
    return this.svc.create(dto, user);
  }

  @Get()
  @UseGuards(RolesGuard(UserRole.ADMIN, UserRole.SUPERVISOR))
  findAll(@User() user: any) {
    return this.svc.findAll(user);
  }

  @Get(`:${LOCATION_ID_PARAM}`)
  @UseGuards(RolesGuard(UserRole.ADMIN, UserRole.SUPERVISOR))
  findOne(@Param(LOCATION_ID_PARAM) id: string, @User() user: any) {
    return this.svc.findOne(Number(id), user);
  }

  @Patch(`:${LOCATION_ID_PARAM}`)
  @UseGuards(RolesGuard(UserRole.ADMIN))
  update(
    @Param(LOCATION_ID_PARAM) id: string,
    @Body() dto: UpdateLocationDto,
    @User() user: any
  ) {
    return this.svc.update(Number(id), dto, user);
  }

  @Delete(`:${LOCATION_ID_PARAM}`)
  @UseGuards(RolesGuard(UserRole.ADMIN))
  remove(@Param(LOCATION_ID_PARAM) id: string, @User() user: any) {
    return this.svc.remove(Number(id), user);
  }
}
