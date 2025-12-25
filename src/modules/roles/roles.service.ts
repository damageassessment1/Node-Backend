import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { AssignPermissionsDto } from "./dto/assign-permissions.dto";

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  // --------------------
  // CRUD
  // --------------------
  async create(dto: CreateRoleDto) {
    try {
      return await this.prisma.role.create({ data: dto });
    } catch {
      throw new BadRequestException("Role already exists");
    }
  }

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException("Role not found");
    }

    return role;
  }

  async update(id: number, dto: UpdateRoleDto) {
    await this.findOne(id);

    return this.prisma.role.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.role.delete({
      where: { id },
    });
  }

  // --------------------
  // PERMISSIONS
  // --------------------
  async assignPermissions(id: number, dto: AssignPermissionsDto) {
    await this.findOne(id);

    await this.prisma.rolePermission.deleteMany({
      where: { roleId: id },
    });

    return this.prisma.rolePermission.createMany({
      data: dto.permissionIds.map(permissionId => ({
        roleId: id,
        permissionId,
      })),
    });
  }
}
