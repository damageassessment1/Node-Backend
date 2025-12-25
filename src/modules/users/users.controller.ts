import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  Res,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto, UpdateUserDto } from "./dto";
import { Response } from "express";
import { User as UserType } from "@prisma/client";
import { User } from "src/common/decorators/user.decorator";
import {
  ADMIN_USERS_ROUTE_PREFIX,
  ROUTES,
  USER_ID_PARAM,
} from "src/common/constats/routes.constants";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequirePermissions } from "src/common/decorators/requir-permission.decorator";
import { permissions } from "src/common/constats/permissions.constants";

@Controller(ADMIN_USERS_ROUTE_PREFIX)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.user.create)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.user.view)
  @Get()
  findAllUsers() {
    return this.usersService.findAllUsers();
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.user.export)
  @Get(ROUTES.ADMIN.ACTIONS.EXPORT)
  async exportUsers(@Res() res: Response) {
    await this.usersService.exportUsers(res);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.user.update)
  @Patch(`:${USER_ID_PARAM}`)
  update(
    @Param(USER_ID_PARAM, ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.user.delete)
  @Delete(`:${USER_ID_PARAM}`)
  remove(
    @Param(USER_ID_PARAM, ParseIntPipe) id: number,
    @User() user: UserType
  ) {
    return this.usersService.remove(id, user);
  }

  @Get("search-supervisors")
  searchSupervisors(@Query("query") query: string) {
    return this.usersService.searchSupervisors(query);
  }
}
