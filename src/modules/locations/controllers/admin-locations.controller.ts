import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { LocationsService } from "../locations.service";
import { User } from "src/common/decorators/user.decorator";
import { CreateLocationDto } from "../dto/create-location.dto";
import { UpdateLocationDto } from "../dto/update-location.dto";
import {
  ADMIN_LOCATIONS_ROUTE_PREFIX,
  LOCATION_ID_PARAM,
} from "src/common/constats/routes.constants";
import { permissions } from "src/common/constats/permissions.constants";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequirePermissions } from "src/common/decorators/requir-permission.decorator";
import { LocationType } from "@prisma/client";

@Controller(ADMIN_LOCATIONS_ROUTE_PREFIX)
export class AdminLocationsController {
  constructor(private readonly svc: LocationsService) {}

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.location.create)
  @Post()
  create(@Body() dto: CreateLocationDto, @User() user: any) {
    return this.svc.create(dto, user);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.location.view)
  @Get()
  findAll(
    @User() user: any,
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("applicationId") applicationId?: string,
    @Query("fullName") fullName?: string,
    @Query("nationalId") nationalId?: string,
    @Query("type") type?: LocationType,
    @Query("neighborhood") neighborhood?: string
  ) {
    return this.svc.findAll(+page, +limit, {
      applicationId,
      fullName,
      nationalId,
      type,
      neighborhood,
    });
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.location.view)
  @Get(`:${LOCATION_ID_PARAM}`)
  findOne(@Param(LOCATION_ID_PARAM) id: string, @User() user: any) {
    return this.svc.findOne(Number(id), user);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.location.update)
  @Patch(`:${LOCATION_ID_PARAM}`)
  update(
    @Param(LOCATION_ID_PARAM) id: string,
    @Body() dto: UpdateLocationDto,
    @User() user: any
  ) {
    return this.svc.update(Number(id), dto, user);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.location.delete)
  @Delete(`:${LOCATION_ID_PARAM}`)
  remove(@Param(LOCATION_ID_PARAM) id: string, @User() user: any) {
    return this.svc.remove(Number(id), user);
  }
}
