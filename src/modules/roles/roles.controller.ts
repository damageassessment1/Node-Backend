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
import { RolesService } from "./roles.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { AssignPermissionsDto } from "./dto/assign-permissions.dto";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequirePermissions } from "src/common/decorators/requir-permission.decorator";
import {
  ADMIN_ROLES_ROUTE_PREFIX,
  ROLES_ID_PARAM,
} from "src/common/constats/routes.constants";
import { permissions } from "src/common/constats/permissions.constants";


@Controller(ADMIN_ROLES_ROUTE_PREFIX)
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.role.create)
  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.service.create(dto);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.role.view)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.role.view)
  @Get(`:${ROLES_ID_PARAM}`)
  findOne(@Param(ROLES_ID_PARAM, ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.role.update)
  @Patch(`:${ROLES_ID_PARAM}`)
  update(
    @Param(ROLES_ID_PARAM, ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto
  ) {
    return this.service.update(id, dto);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.role.delete)
  @Delete(`:${ROLES_ID_PARAM}`)
  remove(@Param(ROLES_ID_PARAM, ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  // --------------------
  // ASSIGN PERMISSIONS
  // --------------------
  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.role.create)
  @Post(`:${ROLES_ID_PARAM}/permissions`)
  assignPermissions(
    @Param(ROLES_ID_PARAM, ParseIntPipe) id: number,
    @Body() dto: AssignPermissionsDto
  ) {
    return this.service.assignPermissions(id, dto);
  }
}
