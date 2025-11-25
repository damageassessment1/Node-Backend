import { ConflictException, Injectable, UnauthorizedException, ForbiddenException, HttpException, HttpStatus } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { JwtService } from "@nestjs/jwt";
import { SigninDto, SignupDto } from "./dto";
import { PrismaService } from "../database/prisma.service";
import { UserRole } from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async verifyNationalId(nationalId:string) {
    const isValid = true // fake

    if (!isValid) {
      throw new HttpException('National ID not found', HttpStatus.NOT_FOUND);
    }

    return { success: true, message: 'National ID verified' };
  }

 
}
