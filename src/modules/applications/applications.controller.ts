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
import { ApplicationsService } from "./applications.service";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UpdateApplicationDto } from "./dto/update-application.dto";
import { RolesGuard } from "src/common/guards/roles.guard";
import { User } from "src/common/decorators/user.decorator";
import { UpdateApplicationLocationDto } from "./dto/update-application-location.dto";
import { AddLocationDto } from "./dto/add-location.dto";
import { AddExtraDataDto } from "./dto/add-extradata.dto";
import { Citizen as CitizenType, LocationType } from "@prisma/client";
import { Citizen } from "src/common/decorators/citizen.decorator";

@Controller("applications")
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Post()
  @UseGuards(RolesGuard("admin"))
  async create(@Body() dto: CreateApplicationDto, @User() user: any) {
    return this.service.create(dto, user);
  }

  @Get()
  @UseGuards(RolesGuard("admin", "supervisor"))
  async findAll(@User() user: any) {
    return this.service.findAll(user);
  }

  @Get("/my-application")
  async getMyApplicationInfo(@Citizen() user: CitizenType) {
    return this.service.getMyApplicationInfo(user);
  }

    // Add previous location to application
  @Post("/add-previous-location")
  async addPreviousLocation(
    @Body() dto: AddLocationDto,
    @Citizen() user: CitizenType
  ) {
    return this.service.addLocationToApplication(
      dto,
      LocationType.before_war,
      user
    );
  }

  // Add current location to application
  @Post("/add-current-location")
  async addCurrentLocation(
    @Body() dto: AddLocationDto,
    @Citizen() user: CitizenType
  ) {
    return this.service.addLocationToApplication(
      dto,
      LocationType.current,
      user
    );
  }

  // Add extra data (damage/building details) to application
  @Post("/add-extra-data")
  async addExtraData(
    @Body() dto: AddExtraDataDto,
    @Citizen() user: CitizenType
  ) {
    return this.service.addExtraData(dto, user);
  }

  @Get(":id")
  @UseGuards(RolesGuard("admin", "supervisor"))
  async findOne(@Param("id") id: string, @User() user: any) {
    return this.service.findOne(id, user);
  }

  @Get(":id/location")
  @UseGuards(RolesGuard("admin", "supervisor"))
  async getLocation(@Param("id") id: string) {
    return this.service.getLocationByApplication(id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard("admin", "supervisor"))
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateApplicationDto,
    @User() user: any
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(":id")
  @UseGuards(RolesGuard("admin"))
  async remove(@Param("id") id: string, @User() user: any) {
    return this.service.remove(id, user);
  }

  @Patch(":id/location")
  @UseGuards(RolesGuard("admin", "supervisor"))
  async updateLocation(
    @Param("id") id: string,
    @Body() dto: UpdateApplicationLocationDto,
    @User() user: any
  ) {
    return this.service.updateLocationByApplication(id, dto, user);
  }

}
