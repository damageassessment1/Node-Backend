import { Body, Controller, Get, Param, Patch, Put } from "@nestjs/common";
import { Citizen as CitizenType } from "@prisma/client";
import { Citizen } from "src/common/decorators/citizen.decorator";
import { ApplicationsService } from "../applications.service";
import { Public } from "src/common/decorators/public-endpoint.decorator";
import {
  APPLICATION_ID_PARAM,
  CITIZEN_APPLICATIONS_ROUTE_PREFIX,
  ROUTES,
} from "src/common/constats/routes.constants";
import { CitizenUpdateApplicationDto } from "../dto/citizen-update-application.dto";

@Controller(CITIZEN_APPLICATIONS_ROUTE_PREFIX)
export class CitizenApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Get()
  async getMyApplications(@Citizen() user: CitizenType) {
    return this.service.getMyApplications(user);
  }

  @Get(`${ROUTES.CITIZEN.APPLICATION.TRACK}/:${APPLICATION_ID_PARAM}`)
  @Public()
  async findApplicationById(@Param(APPLICATION_ID_PARAM) id: string) {
    return this.service.trackApplicationById(id);
  }

  @Put(`:${APPLICATION_ID_PARAM}`)
  async updateApplication(@Param(APPLICATION_ID_PARAM) id: string,@Body() dto:CitizenUpdateApplicationDto,@Citizen() citizen: CitizenType) {
    return this.service.updateApplication(id,dto,citizen);
  }
}
