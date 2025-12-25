import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { UpdatePermissionDto } from "./dto/update-permission.dto";

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePermissionDto) {
    try {
      return await this.prisma.permission.create({
        data: dto,
      });
    } catch {
      throw new BadRequestException("Permission already exists");
    }
  }

  async findAll() {
    return this.prisma.permission.findMany({
      orderBy: { key: "asc" },
    });
  }

 
  async update(id: number, dto: UpdatePermissionDto) {
    await this.findPermissionById(id);

    return this.prisma.permission.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findPermissionById(id);

    return this.prisma.permission.delete({
      where: { id },
    });
  }



  // HELPER FUNCTUIONS
   private async findPermissionById(id: number) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException("Permission not found");
    }

    return permission;
  }

}
