import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { PermissionsService } from "./permissions.service";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { UpdatePermissionDto } from "./dto/update-permission.dto";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequirePermissions } from "src/common/decorators/requir-permission.decorator";
import {
  ADMIN_PERMISSIONS_ROUTE_PREFIX,
  PERMISSIONS_ID_PARAM,
} from "src/common/constats/routes.constants";
import { permissions } from "src/common/constats/permissions.constants";

@Controller(ADMIN_PERMISSIONS_ROUTE_PREFIX)
export class PermissionsController {
  constructor(private readonly service: PermissionsService) {}

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.permission.create)
  @Post()
  create(@Body() dto: CreatePermissionDto) {
    return this.service.create(dto);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.permission.view)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.permission.update)
  @Patch(`:${PERMISSIONS_ID_PARAM}`)
  update(
    @Param(PERMISSIONS_ID_PARAM, ParseIntPipe) id: number,
    @Body() dto: UpdatePermissionDto
  ) {
    return this.service.update(id, dto);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.permission.delete)
  @Delete(`:${PERMISSIONS_ID_PARAM}`)
  remove(@Param(PERMISSIONS_ID_PARAM, ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
