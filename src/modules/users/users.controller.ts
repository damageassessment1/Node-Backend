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
import { RolesGuard } from "src/common/guards/roles.guard";
import { Response } from "express";
import { UserRole ,User as UserType} from "@prisma/client";
import { User } from "src/common/decorators/user.decorator";
import { ADMIN_ROUTES, ADMIN_USERS_ROUTE_PREFIX, USER_ID_PARAM } from "src/common/constats/routes.constants";

@Controller(ADMIN_USERS_ROUTE_PREFIX)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard(UserRole.ADMIN))
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(RolesGuard(UserRole.ADMIN))
  findAllUsers() {
    return this.usersService.findAllUsers();
  }

  @Get(ADMIN_ROUTES.USERS_EXPORT)
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async exportUsers(@Res() res: Response) {
    await this.usersService.exportUsers(res);
  }

  @Patch(`:${USER_ID_PARAM}`)
  @UseGuards(RolesGuard(UserRole.ADMIN))
  update(
    @Param(USER_ID_PARAM, ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(`:${USER_ID_PARAM}`)
  @UseGuards(RolesGuard(UserRole.ADMIN))
  remove(@Param(USER_ID_PARAM, ParseIntPipe) id: number,@User() user:UserType) {
    return this.usersService.remove(id,user);
  }

  @Get("search-supervisors")
  @UseGuards(RolesGuard(UserRole.ADMIN))
  searchSupervisors(@Query("query") query: string) {
    return this.usersService.searchSupervisors(query);
  }
}
