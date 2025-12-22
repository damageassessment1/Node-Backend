import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { LocationsService } from "../locations.service";
import { Citizen as CitizenType, LocationType } from "@prisma/client";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { AddCurrentLocationDto, AddPreviousLocationDto } from "../dto/add-location.dto";
import { UploadsValidationPipe } from "src/common/validators/upload-validation.pipe";
import { Citizen } from "src/common/decorators/citizen.decorator";

@Controller("citizen/locations")
export class CitizenLocationsController {
  constructor(private readonly service: LocationsService) {}


  // Add previous location to application
  @Post("/previous")
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
    return this.service.addPreviousLocation(
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
  @Post("/current")
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
 
}
