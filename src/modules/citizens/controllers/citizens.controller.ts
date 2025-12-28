import {
  Body,
  Controller,
  Put,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { CitizensService } from "../citizens.service";
import { ROUTES } from "src/common/constats/routes.constants";
import { Citizen as CitizenType } from "@prisma/client";

import { Citizen } from "src/common/decorators/citizen.decorator";
import { UpdateProfileDto } from "../dto/update-profile.dto";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { UploadsValidationPipe } from "src/common/validators/upload-validation.pipe";
@Controller("citizen")
export class CitizensController {
  constructor(private service: CitizensService) {}

  @Put(ROUTES.CITIZEN.PROFILE.UPDATE)
  @UseInterceptors(FileFieldsInterceptor([{ name: "avatar", maxCount: 1 }]))
  async updateProfileData(
    @Citizen() citizen: CitizenType,
    @UploadedFiles(new UploadsValidationPipe())
    uploads: {
      avatar: Express.Multer.File[];
    },
    @Body() dto: UpdateProfileDto
  ) {
    return this.service.updateProfileData(citizen, dto, {
      avatar: uploads.avatar?.[0],
    });
  }
}
