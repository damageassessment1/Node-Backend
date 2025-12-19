import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";
import {
  ChangePasswordDto,
  CitizenLoginDto,
  CompleteSignupDto,
  SigninDto,
  VerifyIdDto,
  VerifyQuestionsDto,
} from "./dto";
import { Public } from "src/common/decorators/public-endpoint.decorator";
import { Citizen as CitizenType, User as UserType } from "@prisma/client";
import { Citizen } from "src/common/decorators/citizen.decorator";
import { User } from "src/common/decorators/user.decorator";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Step 1: Verify National ID
   */
  @Post("verify-id")
  @Public()
  async verifyNationalId(@Body() dto: VerifyIdDto) {
    return this.authService.verifyNationalId(dto.nationalId);
  }
  /**
   * Step 2: Verify Personal Questions
   */
  @Post("verify-questions")
  @Public()
  async verifyQuestions(@Body() dto: VerifyQuestionsDto) {
    return this.authService.verifySecurityQuestions(
      dto.nationalId,
      dto.answers
    );
  }

  /**
   * Step 3: Complete Signup
   */
  @Post("complete-signup")
  @Public()
  async signup(@Body() dto: CompleteSignupDto) {
    return this.authService.completeCitizenSignup(dto);
  }

  /**
   * Step 3: Citizen Login
   */
  @Post("citizen-login")
  @Public()
  async citizenLogin(@Body() dto: CitizenLoginDto) {
    return this.authService.citizenLogin(dto.nationalId, dto.password);
  }

  @Post("signin")
  @Public()
  async signIn(@Body() dto: SigninDto) {
    return this.authService.signIn(dto);
  }

  @Post("change-password")
  async changePassword(@Body() dto: ChangePasswordDto,@Citizen() citizen:CitizenType,@User() user:UserType){
    const id = citizen.id || user.id
    const userType = citizen ? "citizen" : user ? "user" : null
    return this.authService.changePassword(dto,id,userType)
  }

}
