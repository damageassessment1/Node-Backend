import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { ChangePasswordDto, SigninDto } from "../dto";
import { Public } from "src/common/decorators/public-endpoint.decorator";
import { UserRole, User as UserType } from "@prisma/client";
import { User } from "src/common/decorators/user.decorator";
import {
  ADMIN_AUTH_ROUTE_PREFIX,
  ROUTES,
} from "src/common/constats/routes.constants";
import { ResetPasswordDto, ResetPasswordRequestDto } from "../dto/change-password.dto";
import { RolesGuard } from "src/common/guards/roles.guard";

@Controller(ADMIN_AUTH_ROUTE_PREFIX)
export class AdminAuthController {
  constructor(private authService: AuthService) {}

  @Post(ROUTES.ADMIN.AUTH.SIGNIN)
  @Public()
  async signIn(@Body() dto: SigninDto) {
    return this.authService.adminSignIn(dto);
  }

  @Post(ROUTES.ADMIN.AUTH.CHANGE_PASSWORD)
  @UseGuards(RolesGuard(UserRole.ADMIN, UserRole.SUPERVISOR))
  async changePassword(@Body() dto: ChangePasswordDto, @User() user: UserType) {
    return this.authService.adminChangePassword(dto, user);
  }

  // @Post("reset-password/request")
  // @UseGuards(RolesGuard(UserRole.ADMIN, UserRole.SUPERVISOR))
  // async resetPasswordRequest(
  //   @Body() dto: ResetPasswordRequestDto
  // ) {
  //   return this.authService.adminResetPasswordRequest(dto.email);
  // }

  // // Step 2: Reset password
  // @Post("reset-password")
  // @UseGuards(RolesGuard(UserRole.ADMIN, UserRole.SUPERVISOR))
  // async resetPassword(
  //   @Body() dto: ResetPasswordDto
  // ) {
  //   return this.authService.adminResetPassword(dto.token, dto.newPassword);
  // }
}
