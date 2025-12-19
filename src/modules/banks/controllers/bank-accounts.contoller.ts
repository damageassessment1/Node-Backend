import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { BanksService } from "../banks.service";
import { RolesGuard } from "src/common/guards/roles.guard";
import {
  Citizen as CitizenType,
  User as UserType,
  UserRole,
} from "@prisma/client";
import { CreateBankAccountDto, UpdateBankAccountDto } from "../dto/bank.dto";
import { Citizen } from "src/common/decorators/citizen.decorator";
import { User } from "src/common/decorators/user.decorator";
import { Response } from "express";

@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private service: BanksService) {}


  @Get()
  @UseGuards(RolesGuard(UserRole.ADMIN))
  getAllBankAcountsForCitizens(){
    return this.service.getAllBankAcountsForCitizens();

  }

  // =====================
  // Admin exports
  // =====================
  @Get('export')
  @UseGuards(RolesGuard(UserRole.ADMIN))
  exportBankAccounts(@Res() res: Response) {
    return this.service.exportBankAccounts(res);
  }

  // =====================
  // Citizen (self)
  // =====================
  @Post('my-accounts')
  createMyBankAccount(
    @Body() dto: CreateBankAccountDto,
    @Citizen() citizen: CitizenType
  ) {
    return this.service.createMyBankAccount(dto, citizen);
  }


  @Get('my-accounts')
  getCitizenAccounts(
    @Citizen() citizen:CitizenType
  ) {
    return this.service.getMyBankAccounts(citizen);
  }


  // =====================
  // Admin (citizen scoped)
  // =====================
  @Post('citizens/:citizenId')
  @UseGuards(RolesGuard(UserRole.ADMIN))
  createForCitizen(
    @Param('citizenId', ParseIntPipe) citizenId: number,
    @Body() dto: CreateBankAccountDto
  ) {
    return this.service.createBankAccountForCitizen(citizenId, dto);
  }



  @Patch(':accountId/citizens/:citizenId')
  @UseGuards(RolesGuard(UserRole.ADMIN))
  updateAccount(
    @Param('citizenId', ParseIntPipe) citizenId: number,
    @Param('accountId') accountId: string,
    @Body() dto: UpdateBankAccountDto
  ) {
    return this.service.updateBankAccount(citizenId, accountId, dto);
  }

  @Delete(':accountId/citizens/:citizenId')
  @UseGuards(RolesGuard(UserRole.ADMIN))
  deleteAccount(
    @Param('citizenId', ParseIntPipe) citizenId: number,
    @Param('accountId') accountId: string
  ) {
    return this.service.deleteBankAccount(citizenId, accountId);
  }
}

