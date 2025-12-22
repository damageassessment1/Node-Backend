import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { ChangePasswordDto, SigninDto } from "../dto";
import { Public } from "src/common/decorators/public-endpoint.decorator";
import { User as UserType } from "@prisma/client";
import { User } from "src/common/decorators/user.decorator";
import {
  ADMIN_AUTH_ROUTE_PREFIX,
  ROUTES,
} from "src/common/constats/routes.constants";

@Controller(ADMIN_AUTH_ROUTE_PREFIX)
export class AdminAuthController {
  constructor(private authService: AuthService) {}

  @Post(ROUTES.ADMIN.AUTH.SIGNIN)
  @Public()
  async signIn(@Body() dto: SigninDto) {
    return this.authService.adminSignIn(dto);
  }

  @Post(ROUTES.ADMIN.AUTH.CHANGE_PASSWORD)
  async changePassword(@Body() dto: ChangePasswordDto, @User() user: UserType) {
    return this.authService.changePassword(dto, user.id, "user");
  }
}
