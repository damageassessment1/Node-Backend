import { Body, Controller, Get, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import {  SigninDto, SignupDto } from "./dto";
import { Public } from "src/common/decorators/public-endpoint.decorator";
import { User } from "src/common/decorators/user.decorator";

@Controller("auth")
export class AuthController {
  constructor(private authservice: AuthService) {}

  @Post("signup")
  @Public()
  verifyNationalId(@Body('national_id') nationalId: string) {
   return  this.authservice.verifyNationalId(nationalId)
  }

  
}
