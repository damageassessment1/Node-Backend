import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "../auth.service";
import {
  ChangePasswordDto,
  CitizenLoginDto,
  CompleteSignupDto,
  SigninDto,
  VerifyIdDto,
  VerifyQuestionsDto,
} from "../dto";
import { Public } from "src/common/decorators/public-endpoint.decorator";
import { Citizen as CitizenType, User as UserType } from "@prisma/client";
import { Citizen } from "src/common/decorators/citizen.decorator";
import { User } from "src/common/decorators/user.decorator";

@Controller("auth/admin")
export class AdminAuthController {
  constructor(private authService: AuthService) {}

 

  @Post("signin")
  @Public()
  async signIn(@Body() dto: SigninDto) {
    return this.authService.adminSignIn(dto);
  }

  @Post("change-password")
  async changePassword(@Body() dto: ChangePasswordDto,@Citizen() citizen:CitizenType,@User() user:UserType){
    const id = citizen.id || user.id
    const userType = citizen ? "citizen" : user ? "user" : null
    return this.authService.changePassword(dto,id,userType)
  }

}
