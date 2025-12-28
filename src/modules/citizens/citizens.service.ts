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
import * as ExcelJS from "exceljs";
import { Response } from "express";
import { baseCitizenSelect, citizenProfileSelect } from "src/common/prisma/selects/citizen.select";
import { Citizen } from "@prisma/client";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { StorageService } from "../storage/storage.service";
@Injectable()
export class CitizensService {
  constructor(
    private prisma: PrismaService,
    private readonly storageService: StorageService
  ) {}

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
      father_name: createDto.father_name,
      grandfather_name: createDto.grandfather_name,
      family_name: createDto.family_name,
      full_name:
        `${createDto.first_name} ${createDto.father_name} ${createDto.grandfather_name} ${createDto.family_name}`.trim(),
      phone_number: createDto.phone_number,
    };
    const citizen = await this.prisma.citizen.create({
      data,
      select: baseCitizenSelect,
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
        ...baseCitizenSelect,
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

    if (
      dto.first_name ||
      dto.father_name ||
      dto.grandfather_name ||
      dto.family_name
    ) {
      dto["full_name"] =
        `${dto.first_name || citizen.first_name} ${dto.father_name || citizen.father_name} ${dto.grandfather_name || citizen.grandfather_name} ${dto.family_name || citizen.family_name}`.trim();
    }
    return this.prisma.citizen.update({
      where: { id },
      data: dto,
      select: baseCitizenSelect,
    });
  }

  async updateProfileData(
    citizen: Citizen,
    dto: UpdateProfileDto,
    uploads: {
      avatar: Express.Multer.File;
    }
  ) {
    // console.log(uploads);
    // console.log(
    //   this.getImagePath(
    //     "https://oufjobpdjqlveupjciuj.supabase.co/storage/v1/object/public/damageassessment/after_war_image/32a3b633-13ef-46de-a887-f1bdb56cfd17.png"
    //   )
    // );

    // return;

    if (
      dto.first_name ||
      dto.father_name ||
      dto.grandfather_name ||
      dto.family_name
    ) {
      dto["full_name"] =
        `${dto.first_name || citizen.first_name} ${dto.father_name || citizen.father_name} ${dto.grandfather_name || citizen.grandfather_name} ${dto.family_name || citizen.family_name}`.trim();
    }

    if (uploads && uploads.avatar) {

      const [file] = await this.storageService.handleUploads(
        uploads.avatar,
        "avatars"
      );
      dto["avatar"] = file.url;

      this.storageService.deleteFile(this.getImagePath(citizen.avatar))
    }

    return this.prisma.citizen.update({
      where: { id: citizen.id },
      data: {
        ...dto,
      },
      select:citizenProfileSelect
    });
  }

  async remove(id: number) {
    const citizen = await this.prisma.citizen.findUnique({ where: { id } });
    if (!citizen) throw new NotFoundException("Citizen not found");
    return this.prisma.citizen.delete({ where: { id }, select: citizenSelect });
  }

  // assignSupervisor functionality removed - supervision is determined by users' role and external admin workflows

  async exportCitizens(res: Response) {
    const citizens = await this.prisma.citizen.findMany({});

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("citizens");

    sheet.columns = [
      { header: "citizen ID", key: "id", width: 30 },
      { header: "Citizen Name", key: "name", width: 30 },
      { header: "Citizen Email", key: "email", width: 30 },
      { header: "Citizen Phone Number", key: "phone", width: 30 },
      { header: "Citizen Gender", key: "gender", width: 30 },
      { header: "Citizen Status", key: "status", width: 30 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];

    citizens.forEach((u) => {
      sheet.addRow({
        id: u.national_id,
        name: u.full_name,
        email: u.email,
        phone: u.phone_number,
        gender: u.gender,
        status: u.status,
        createdAt: u.createdAt.toLocaleString(),
      });
    });

    res.setHeader(
      "Content-Type",
      "citizen/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=citizens.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  }

  private getImagePath(url?: string | null): string | undefined {
    if (!url) return;

    const parts = url.split("/");
    return parts.slice(-2).join("/");
  }
}
