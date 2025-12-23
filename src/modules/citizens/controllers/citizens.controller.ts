import { Body, Controller, Put } from "@nestjs/common";
import { CitizensService } from "../citizens.service";
import { ROUTES } from "src/common/constats/routes.constants";
import { Citizen as CitizenType } from "@prisma/client";

import { Citizen } from "src/common/decorators/citizen.decorator";
import { UpdateProfileDto } from "../dto/update-profile.dto";
@Controller("citizen")
export class CitizensController {
  constructor(private service: CitizensService) {}

  @Put(ROUTES.CITIZEN.PROFILE.UPDATE)
  async updateProfileData(@Citizen() citizen: CitizenType,@Body() dto:UpdateProfileDto) {
    return this.service.updateProfileData(citizen,dto);
  }
}
