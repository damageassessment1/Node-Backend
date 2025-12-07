import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { citizenSelect, locationSelect } from "src/common/prisma/selects";
import { PrismaService } from "../database/prisma.service";
import { CreateCitizenDto } from "./dto/create-citizen.dto";
import { CreateLocationDto } from "./dto/create-location.dto";
import { UpdateCitizenDto } from "./dto/update-citizen.dto";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class CitizensService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateCitizenDto) {
    const existing = await this.prisma.citizen.findUnique({
      where: { national_id: createDto.national_id },
    });
    if (existing) throw new ForbiddenException("Citizen already exists");

    const passwordPlain = createDto.password ?? uuidv4();
    const passwordHash = await bcrypt.hash(passwordPlain, 10);
    const data: any = {
      national_id: createDto.national_id,
      first_name: createDto.first_name,
      family_name: createDto.family_name ?? null,
      password: passwordHash,
    };
    const citizen = await this.prisma.citizen.create({
      data,
      select: citizenSelect,
    });
    return citizen;
  }

  async createLocation(citizenId: number, dto: CreateLocationDto) {
    const citizen = await this.prisma.citizen.findUnique({
      where: { id: citizenId },
    });
    if (!citizen) throw new NotFoundException("Citizen not found");
    const loc = await this.prisma.location.create({
      data: {
        citizenId,
        type: dto.type,
        governorate: dto.governorate ?? null,
        town: dto.town ?? null,
        street: dto.street ?? null,
        block_number: dto.block_number ?? null,
        house_number: dto.house_number ?? null,
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        notes: dto.notes ?? null,
      },
      select: {
        ...locationSelect,
      },
    });
    return loc;
  }

  async findAll(user: any) {
    // If the requester is a supervisor, return only assigned citizens (read-only)
    if (user?.role === "supervisor") {
      return this.prisma.citizen.findMany({
        select: citizenSelect,
        orderBy: { createdAt: "desc" },
      });
    }
    // Admins get all citizens (don't return password)
    return this.prisma.citizen.findMany({
      select: {
        id: true,
        national_id: true,
        first_name: true,
        family_name: true,
        verification_status: true,
        status: true,
        locations: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: number, user: any) {
    const citizen = await this.prisma.citizen.findUnique({
      where: { id },
      select: { ...citizenSelect },
    });
    if (!citizen) throw new NotFoundException("Citizen not found");
    // Supervisor read-only: allow viewing of the citizen details
    return citizen;
  }

  async update(id: number, dto: UpdateCitizenDto, user: any) {
    const citizen = await this.prisma.citizen.findUnique({ where: { id } });
    if (!citizen) throw new NotFoundException("Citizen not found");
    // Supervisor cannot update citizens — update route will be admin-only guard
    return this.prisma.citizen.update({
      where: { id },
      data: dto,
      select: citizenSelect,
    });
  }

  async remove(id: number) {
    const citizen = await this.prisma.citizen.findUnique({ where: { id } });
    if (!citizen) throw new NotFoundException("Citizen not found");
    return this.prisma.citizen.delete({ where: { id }, select: citizenSelect });
  }

  // assignSupervisor functionality removed - supervision is determined by users' role and external admin workflows
}
