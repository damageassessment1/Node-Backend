import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { SigninDto } from "./dto";
import { Public } from "src/common/decorators/public-endpoint.decorator";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Step 1: Verify National ID
   */
  @Post("verify-id")
  @Public()
  async verifyNationalId(@Body("national_id") nationalId: string) {
    return this.authService.verifyNationalId(nationalId);
  }
  /**
   * Step 2: Verify Personal Questions
   */
  @Post("verify-questions")
  @Public()
  async verifyQuestions(
    @Body() body: { national_id: string; answers: Record<string, string> }
  ) {
    return this.authService.verifySecurityQuestions(
      body.national_id,
      body.answers
    );
  }

  /**
   * Step 3: Complete Signup
   */
  @Post("complete-signup")
  @Public()
  async signup(@Body() body: { national_id: string; password: string }) {
    return this.authService.completeCitizenSignup(
      body.national_id,
      body.password
    );
  }

  /**
   * Step 3: Citizen Login
   */
  @Post("citizen-login")
  @Public()
  async citizenLogin(@Body() body: { national_id: string; password: string }) {
    return this.authService.citizenLogin(body.national_id, body.password);
  }

  @Post("signin")
  @Public()
  async signIn(@Body() dto: SigninDto) {
    return this.authService.signIn(dto);
  }

  @Post("signin-form")
  @Public()
  async signInForm(@Req() req: Request, @Body() body: any) {
    let dto: SigninDto | any = body;
    // If body is a raw string like "email=foo@bar.com&password=secret" or JSON string
    const raw = body ?? (req as any).rawBody;
    if (typeof raw === "string") {
      try {
        dto = JSON.parse(raw);
      } catch (e) {
        // Try parse as urlencoded KV string
        const qs = require("querystring");
        const parsed = qs.parse(raw);
        dto = {
          email: parsed.email,
          password: parsed.password,
        };
      }
    }
    if (!dto || !dto.email || !dto.password) {
      // Return a clearer bad request if missing fields
      const { BadRequestException } = require("@nestjs/common");
      throw new BadRequestException(
        "Invalid sign-in payload. Please provide `email` and `password` fields."
      );
    }
    try {
      return await this.authService.signIn(dto);
    } catch (err) {
      console.error("signin-form error:", err);
      throw err;
    }
  }

  @Get("me")
  async me(@Req() req: Request) {
    // Return authenticated user or citizen; useful for token debugging in Postman
    const u = (req as any).user;
    const c = (req as any).citizen;
    return { user: u ?? null, citizen: c ?? null };
  }
}
