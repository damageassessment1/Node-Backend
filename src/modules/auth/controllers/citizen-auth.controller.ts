import {
  Body,
  Controller,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import {
  ChangePasswordDto,
  CitizenLoginDto,
  CompleteSignupDto,
  VerifyIdDto,
  VerifyQuestionsDto,
} from "../dto";
import { Public } from "src/common/decorators/public-endpoint.decorator";
import { Citizen as CitizenType } from "@prisma/client";
import { Citizen } from "src/common/decorators/citizen.decorator";
import {
  CITIZEN_AUTH_ROUTE_PREFIX,
  ROUTES,
} from "src/common/constats/routes.constants";
import {
  ResetPasswordDto,
  ResetPasswordRequestDto,
} from "../dto/change-password.dto";
import { CitizenAuthService } from "../services/citizen-auth.service";
import { CitizenVerificationService } from "../services/citizen-verification.service";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { UploadsValidationPipe } from "src/common/validators/upload-validation.pipe";

@Controller(CITIZEN_AUTH_ROUTE_PREFIX)
export class CitizenAuthController {
  constructor(
    private authService: CitizenAuthService,
    private verificationService: CitizenVerificationService
  ) { }

  /**
   * Step 1: Verify National ID
   */
  @Post(ROUTES.CITIZEN.AUTH.VERIFY_ID)
  @Public()
  async verifyNationalId(@Body() dto: VerifyIdDto) {
    return this.verificationService.verifyNationalId(dto.nationalId);
  }
  /**
   * Step 2: Verify Personal Questions
   */
  @Post(ROUTES.CITIZEN.AUTH.VERIFY_QUESTIONS)
  @Public()
  async verifyQuestions(@Body() dto: VerifyQuestionsDto) {
    return this.verificationService.verifySecurityQuestions(
      dto.nationalId,
      dto.answers
    );
  }

  /**
   * Step 3: Complete Signup
   */
  @Post(ROUTES.CITIZEN.AUTH.COMPLETE_SIGNUP)
  @Public()
  @UseInterceptors(FileFieldsInterceptor([{ name: "avatar", maxCount: 1 }]))
  async signup(
    @Body() dto: CompleteSignupDto,
    @UploadedFiles(new UploadsValidationPipe())
    uploads: {
      avatar: Express.Multer.File[];
    }
  ) {
    return this.authService.completeCitizenSignup(dto, {
      avatar: uploads.avatar?.[0],
    });
  }

  /**
   * Step 3: Citizen Login
   */
  @Post(ROUTES.CITIZEN.AUTH.LOGIN)
  @Public()
  async citizenLogin(@Body() dto: CitizenLoginDto) {
    return this.authService.citizenLogin(dto.nationalId, dto.password);
  }

  @Post(ROUTES.CITIZEN.AUTH.CHANGE_PASSWORD)
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Citizen() citizen: CitizenType
  ) {
    return this.authService.citizenChangePassword(dto, citizen);
  }

  @Post("reset-password/request")
  @Public()
  async resetPasswordRequest(@Body() dto: ResetPasswordRequestDto) {
    return this.authService.citizenResetPasswordRequest(dto.email);
  }

  // Step 2: Reset password
  @Post("reset-password")
  @Public()
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.citizenResetPassword(dto.token, dto.newPassword);
  }
}
