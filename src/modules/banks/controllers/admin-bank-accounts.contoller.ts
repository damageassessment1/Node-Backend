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
import { UserRole } from "@prisma/client";
import {
  CreateBankAccountDto,
  DeleteAccountDto,
  UpdateBankAccountDto,
} from "../dto/bank.dto";
import { Response } from "express";
import {
  ACCOUNT_ID_PARAM,
  ADMIN_BANK_ACCOUNTS_ROUTE_PREFIX,
  ROUTES,
} from "src/common/constats/routes.constants";

@Controller(ADMIN_BANK_ACCOUNTS_ROUTE_PREFIX)
export class AdminBankAccountsController {
  constructor(private service: BanksService) {}

  @Get()
  @UseGuards(RolesGuard(UserRole.ADMIN))
  getAllBankAcountsForCitizens() {
    return this.service.getAllBankAcountsForCitizens();
  }

  @Post()
  @UseGuards(RolesGuard(UserRole.ADMIN))
  createForCitizen(@Body() dto: CreateBankAccountDto) {
    return this.service.createBankAccountForCitizen(dto);
  }

  // =====================
  // Admin exports
  // =====================
  @Get(ROUTES.ADMIN.ACTIONS.EXPORT)
  @UseGuards(RolesGuard(UserRole.ADMIN))
  exportBankAccounts(@Res() res: Response) {
    return this.service.exportBankAccounts(res);
  }

  // =====================
  // Admin (citizen scoped)
  // =====================

  @Patch(`:${ACCOUNT_ID_PARAM}`)
  @UseGuards(RolesGuard(UserRole.ADMIN))
  updateAccount(
    @Param(ACCOUNT_ID_PARAM) accountId: string,
    @Body() dto: UpdateBankAccountDto
  ) {
    return this.service.updateBankAccount(accountId, dto);
  }

  @Delete(`:${ACCOUNT_ID_PARAM}`)
  @UseGuards(RolesGuard(UserRole.ADMIN))
  deleteAccount(
    @Body() dto: DeleteAccountDto,
    @Param(ACCOUNT_ID_PARAM) accountId: string
  ) {
    return this.service.deleteBankAccount(dto.citizenId, accountId);
  }
}
