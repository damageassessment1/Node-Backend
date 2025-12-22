import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { Citizen as CitizenType, LocationType } from "@prisma/client";
import { Citizen } from "src/common/decorators/citizen.decorator";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { UploadsValidationPipe } from "src/common/validators/upload-validation.pipe";
import { ApplicationsService } from "../applications.service";
import { AddCurrentLocationDto, AddPreviousLocationDto } from "../../locations/dto/add-location.dto";
import { Public } from "src/common/decorators/public-endpoint.decorator";

@Controller("citizen/applications")
export class CitizenApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Get()
  async getMyApplicationInfo(@Citizen() user: CitizenType) {
    return this.service.getMyApplications(user);
  }

  @Get("/track/:id")
  @Public()
  async findApplicationById(@Param("id") id: string) {
    return this.service.trackApplicationById(id);
  }

}
