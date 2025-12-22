import {
  Controller,
  Get,
} from "@nestjs/common";
import { BanksService } from "../banks.service";

@Controller('banks')
export class CitizenBankAccountsController {
  constructor(private service: BanksService) {}

  @Get()
  getAllBanks() {
    return this.service.getAllBanks();
  }
}
