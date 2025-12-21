import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApplicationsService } from "./applications.service";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UpdateApplicationDto } from "./dto/update-application.dto";
import { RolesGuard } from "src/common/guards/roles.guard";
import { User } from "src/common/decorators/user.decorator";
import { AddCurrentLocationDto, AddPreviousLocationDto } from "./dto/add-location.dto";
import { AddExtraDataDto } from "./dto/add-extradata.dto";
import { Citizen as CitizenType, LocationType, UserRole } from "@prisma/client";
import { Citizen } from "src/common/decorators/citizen.decorator";
import { Response } from "express";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { UploadsValidationPipe } from "src/common/validators/upload-validation.pipe";

@Controller("applications")
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Post()
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async create(@Body() dto: CreateApplicationDto, @User() user: any) {
    return this.service.create(dto, user);
  }

  @Get()
  @UseGuards(RolesGuard(UserRole.ADMIN, UserRole.SUPERVISOR))
  async findAll(@User() user: any) {
    return this.service.findAll(user);
  }

  @Get("/my-applications")
  async getMyApplicationInfo(@Citizen() user: CitizenType) {
    return this.service.getMyApplications(user);
  }

  // Add previous location to application
  @Post("/add-previous-location")
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "beforeWarImage", maxCount: 1 },
      { name: "afterWarImage", maxCount: 1 },
      { name: "ownershipDocuments", maxCount: 5 },
    ])
  )
  async addPreviousLocation(
    @Body() dto: AddPreviousLocationDto,

    @UploadedFiles(new UploadsValidationPipe())
    uploads: {
      beforeWarImage?: Express.Multer.File[];
      afterWarImage?: Express.Multer.File[];
      ownershipDocuments?: Express.Multer.File[];
    },

    @Citizen() user: CitizenType
  ) {
    return this.service.createApplicationAndLocation(
      dto,
      LocationType.BEFORE_WAR,
      user,
      {
        beforeWarImage: uploads.beforeWarImage?.[0],
        afterWarImage: uploads.afterWarImage?.[0],
        ownershipDocuments: uploads.ownershipDocuments,
      }
    );
  }

  // Add current location to application
  @Post("/add-current-location")
  async addCurrentLocation(
    @Body() dto: AddCurrentLocationDto,
    @Citizen() user: CitizenType
  ) {
    return this.service.addCurrentLocation(
      dto,
      LocationType.CURRENT,
      user
    );
  }

  @Get("export-applications")
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async exportApplications(@Res() res: Response) {
    await this.service.exportApplications(res);
  }

  @Get(":id")
  @UseGuards(RolesGuard(UserRole.ADMIN, UserRole.SUPERVISOR))
  async findOne(@Param("id") id: string, @User() user: any) {
    return this.service.findOne(id, user);
  }

  // @Get(":id/location")
  // @UseGuards(RolesGuard("admin", "supervisor"))
  // async getLocation(@Param("id") id: string) {
  //   return this.service.getLocationByApplication(id);
  // }

  @Patch(":id")
  @UseGuards(RolesGuard(UserRole.ADMIN, UserRole.SUPERVISOR))
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateApplicationDto,
    @User() user: any
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(":id")
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async remove(@Param("id") id: string, @User() user: any) {
    return this.service.remove(id, user);
  }

  // @Patch(":id/location")
  // @UseGuards(RolesGuard("admin", "supervisor"))
  // async updateLocation(
  //   @Param("id") id: string,
  //   @Body() dto: UpdateApplicationLocationDto,
  //   @User() user: any
  // ) {
  //   return this.service.updateLocationByApplication(id, dto, user);
  // }
}
