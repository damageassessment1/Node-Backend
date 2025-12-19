import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { BanksService } from "./banks.service";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Citizen as CitizenType, User as UserType, UserRole } from "@prisma/client";
import { CreateBankAccountDto, UpdateBankAccountDto } from "./dto/bank.dto";
import { Citizen } from "src/common/decorators/citizen.decorator";
import { User } from "src/common/decorators/user.decorator";

@Controller("bank-accounts")
export class BanksController {
  constructor(private service: BanksService) {}


  @Get("/list")
  getAllBanks() {
    return this.service.getAllBanks();
  }

  @Post()
  addBankAccount(
    @Body() dto: CreateBankAccountDto,
    @Citizen() citizen: CitizenType,
  ) {
    return this.service.addBankAccount(dto, citizen);
  }

  @Get(':citizenId')
  @UseGuards(RolesGuard(UserRole.ADMIN,UserRole.SUPERVISOR))
  getCitizenBankAccounts(
    @Param('citizenId', ParseIntPipe) citizenId: number,
    @User() user: UserType,
  ) {
    return this.service.getCitizenBankAccounts(citizenId, user);
  }

  @Patch(':citizenId/accounts/:accountId')
  @UseGuards(RolesGuard(UserRole.ADMIN))
  updateBankAccount(
    @Param('citizenId', ParseIntPipe) citizenId: number,
    @Param('accountId') accountId: string,
    @Body() dto: UpdateBankAccountDto,
    @User() user: UserType,
  ) {
    return this.service.updateBankAccount(citizenId, accountId, dto, user);
  }

  @Delete(':citizenId/accounts/:accountId')
  @UseGuards(RolesGuard(UserRole.ADMIN))
  deleteBankAccount(
    @Param('citizenId', ParseIntPipe) citizenId: number,
    @Param('accountId') accountId: string,
    @User() user: UserType,
  ) {
    return this.service.deleteBankAccount(citizenId, accountId, user);
  }


}