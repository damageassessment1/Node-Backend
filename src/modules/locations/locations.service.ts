import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreateLocationDto } from "./dto/create-location.dto";
import { UpdateLocationDto } from "./dto/update-location.dto";
import { locationSelect } from "src/common/prisma/selects";
import { LocationType, User } from "@prisma/client";

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLocationDto, user: any) {
    if (user?.role !== "admin")
      throw new ForbiddenException("Insufficient permissions");

    const app = await this.prisma.application.findFirst({
      where: { citizenId: dto.citizenId },
      include: { locations: true },
    });

    if (!app) throw new NotFoundException("Application not found");

    if (app.locations.some((loc) => loc.type === dto.type)) {
      throw new ForbiddenException(
        `Application already has a ${dto.type} location`
      );
    }

    const loc = await this.prisma.location.create({
      data: {
        ...dto,
        citizenId: dto.citizenId,
        applicationId: app.id,
      },
    });

    return loc;
  }

  async findAll(user: User) {
    // Both admin and supervisor can read locations
    return this.prisma.location.findMany({
      select: locationSelect,
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: number, user: any) {
    if (!id || typeof id !== "number" || isNaN(id))
      throw new BadRequestException("Valid numeric id param is required");
    const loc = await this.prisma.location.findUnique({
      where: { id },
      select: locationSelect,
    });
    if (!loc) throw new NotFoundException("Location not found");
    return loc;
  }

  async update(id: number, dto: UpdateLocationDto, user: any) {
    if (!id || typeof id !== "number" || isNaN(id))
      throw new BadRequestException("Valid numeric id param is required");
    if (user?.role !== "admin")
      throw new ForbiddenException("Insufficient permissions");
    const existing = await this.prisma.location.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Location not found");
    const updated = await this.prisma.location.update({
      where: { id },
      data: dto,
      select: locationSelect,
    });
    return updated;
  }

  async remove(id: number, user: any) {
    if (!id || typeof id !== "number" || isNaN(id))
      throw new BadRequestException("Valid numeric id param is required");
    if (user?.role !== "admin")
      throw new ForbiddenException("Insufficient permissions");
    const existing = await this.prisma.location.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Location not found");
    // Unlink application if any
    if (existing.applicationId) {
      await this.prisma.location
        .update({ where: { id }, data: { applicationId: null } })
        .catch(() => {});
    }
    await this.prisma.location.delete({ where: { id } });
    return { success: true };
  }
}
