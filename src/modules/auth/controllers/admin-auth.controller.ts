import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ChangePasswordDto, SigninDto } from "../dto";
import { Public } from "src/common/decorators/public-endpoint.decorator";
import { User as UserType } from "@prisma/client";
import { User } from "src/common/decorators/user.decorator";
import {
  ADMIN_AUTH_ROUTE_PREFIX,
  ROUTES,
} from "src/common/constats/routes.constants";
import { ResetPasswordDto, ResetPasswordRequestDto } from "../dto/change-password.dto";
import { AdminAuthService } from "../services/admin-auth.service";

@Controller(ADMIN_AUTH_ROUTE_PREFIX)
export class AdminAuthController {
  constructor(private authService: AdminAuthService) {}

  @Post(ROUTES.ADMIN.AUTH.SIGNIN)
  @Public()
  async signIn(@Body() dto: SigninDto) {
    return this.authService.adminSignIn(dto);
  }

  @Post(ROUTES.ADMIN.AUTH.CHANGE_PASSWORD)
  async changePassword(@Body() dto: ChangePasswordDto, @User() user: UserType) {
    return this.authService.adminChangePassword(dto, user);
  }

  // @Post("reset-password/request")
  // @Public()
  // async resetPasswordRequest(
  //   @Body() dto: ResetPasswordRequestDto
  // ) {
  //   return this.authService.adminResetPasswordRequest(dto.email);
  // }

  // // Step 2: Reset password
  // @Post("reset-password")
  // @Public()
  // async resetPassword(
  //   @Body() dto: ResetPasswordDto
  // ) {
  //   return this.authService.adminResetPassword(dto.token, dto.newPassword);
  // }
}
