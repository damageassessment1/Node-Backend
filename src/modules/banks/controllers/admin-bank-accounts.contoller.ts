import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { BanksService } from "../banks.service";
import { CreateBankAccountDto, UpdateBankAccountDto } from "../dto/bank.dto";
import { Response } from "express";
import {
  ACCOUNT_ID_PARAM,
  ADMIN_BANK_ACCOUNTS_ROUTE_PREFIX,
  ROUTES,
} from "src/common/constats/routes.constants";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequirePermissions } from "src/common/decorators/requir-permission.decorator";
import { permissions } from "src/common/constats/permissions.constants";

@Controller(ADMIN_BANK_ACCOUNTS_ROUTE_PREFIX)
export class AdminBankAccountsController {
  constructor(private service: BanksService) {}

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.bank_account.view)
  @Get()
  getAllBankAcountsForCitizens() {
    return this.service.getAllBankAcountsForCitizens();
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.bank_account.create)
  @Post()
  createForCitizen(@Body() dto: CreateBankAccountDto) {
    return this.service.createBankAccountForCitizen(dto);
  }

  // =====================
  // Admin exports
  // =====================
  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.bank_account.export)
  @Get(ROUTES.ADMIN.ACTIONS.EXPORT)
  exportBankAccounts(@Res() res: Response) {
    return this.service.exportBankAccounts(res);
  }

  // =====================
  // Admin (citizen scoped)
  // =====================
  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.bank_account.update)
  @Patch(`:${ACCOUNT_ID_PARAM}`)
  updateAccount(
    @Param(ACCOUNT_ID_PARAM) accountId: string,
    @Body() dto: UpdateBankAccountDto
  ) {
    return this.service.updateBankAccount(accountId, dto);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions(permissions.bank_account.delete)
  @Delete(`:${ACCOUNT_ID_PARAM}`)
  deleteAccount(@Param(ACCOUNT_ID_PARAM) accountId: string) {
    return this.service.deleteBankAccount(accountId);
  }
}
