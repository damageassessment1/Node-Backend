import {
  Body,
  Controller,
  Get,
  Post,
} from "@nestjs/common";
import { BanksService } from "../banks.service";
import {
  Citizen as CitizenType,
} from "@prisma/client";
import { CreateBankAccountDto } from "../dto/bank.dto";
import { Citizen } from "src/common/decorators/citizen.decorator";
import { CITIZEN_BANK_ACCOUNTS_ROUTE_PREFIX } from "src/common/constats/routes.constants";


@Controller(CITIZEN_BANK_ACCOUNTS_ROUTE_PREFIX)
export class CitizenBankAccountsController {
  constructor(private service: BanksService) {}

  
  @Post()
  createMyBankAccount(
    @Body() dto: CreateBankAccountDto,
    @Citizen() citizen: CitizenType
  ) {
    return this.service.createMyBankAccount(dto, citizen);
  }


  @Get()
  getCitizenAccounts(
    @Citizen() citizen:CitizenType
  ) {
    return this.service.getMyBankAccounts(citizen);
  }
}
