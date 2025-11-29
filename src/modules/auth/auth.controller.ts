import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { SigninDto } from "./dto";
import { Public } from "src/common/decorators/public-endpoint.decorator";
import { User } from "src/common/decorators/user.decorator";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  @Public()
  verifyNationalId(@Body("national_id") nationalId: string) {
    return this.authService.verifyNationalId(nationalId);
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
w
  @Get("me")
  async me(@Req() req: Request) {
    // Return authenticated user or citizen; useful for token debugging in Postman
    const u = (req as any).user;
    const c = (req as any).citizen;
    return { user: u ?? null, citizen: c ?? null };
  }
}
