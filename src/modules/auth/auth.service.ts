import { ConflictException, Injectable, UnauthorizedException, ForbiddenException, HttpException, HttpStatus } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { JwtService } from "@nestjs/jwt";
import { SigninDto } from "./dto";
import { baseUserSelect } from "src/common/prisma/selects";
import { PrismaService } from "../database/prisma.service";

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

  async signIn(dto: SigninDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email }, select: { ...baseUserSelect, password: true }});
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const token = await this.jwtService.signAsync({ sub: user.id, type: 'user', email: user.email, role: user.role });
    const { password, ...safeUser } = user as any;
    return { access_token: token, user: safeUser };
  }

 
}
