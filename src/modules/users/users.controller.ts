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
import { UserRole } from "@prisma/client";

@Controller("users")
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

  @Get("export-users")
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async exportUsers(@Res() res: Response) {
    await this.usersService.exportUsers(res);
  }

  @Patch(":id")
  @UseGuards(RolesGuard(UserRole.ADMIN))
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard(UserRole.ADMIN))
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Get("search-supervisors")
  @UseGuards(RolesGuard(UserRole.ADMIN))
  searchSupervisors(@Query("query") query: string) {
    return this.usersService.searchSupervisors(query);
  }
}
