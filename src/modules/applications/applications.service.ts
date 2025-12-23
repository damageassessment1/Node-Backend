import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UpdateApplicationDto } from "./dto/update-application.dto";
import { applicationSelect, citizenSelect } from "src/common/prisma/selects";
import { UpdateApplicationLocationDto } from "./dto/update-application-location.dto";
import { generateApplicationId } from "src/common/utils";
import { Citizen } from "@prisma/client";
import * as ExcelJS from "exceljs";
import { Response } from "express";
import { baseApplicationSelect } from "src/common/prisma/selects/application.select";
import { serializeMyApplicationsRes } from "src/common/serializers/application.serializer";
import { CitizenUpdateApplicationDto } from "./dto/citizen-update-application.dto";

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApplicationDto, user: any) {
    // Only admin can create
    // Verify citizen exists
    const citizen = await this.prisma.citizen.findUnique({
      where: { id: dto.citizenId },
    });
    if (!citizen) throw new NotFoundException("Citizen not found");

    // Generate custom application ID
    const customId = generateApplicationId();

    // Create application without requiring a location
    const app = await this.prisma.application.create({
      data: {
        id: customId,
        citizenId: dto.citizenId,
        status: dto.status,
        notes: dto.notes ?? null,
        createdById: user?.id ?? null,
      },
    });

    // Return application with all details
    const result = await this.prisma.application.findUnique({
      where: { id: app.id },
      select: applicationSelect,
    });
    return result;
  }

  async findAll(user: any) {
    // Admins & supervisors can list
    return this.prisma.application.findMany({
      select: applicationSelect,
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, user: any) {
    const app = await this.prisma.application.findUnique({
      where: { id },
      select: applicationSelect,
    });
    if (!app) throw new NotFoundException("Application not found");
    return app;
  }

  async getLocationByApplication(id: string) {
    // Find location with applicationId = id
    const location = await this.prisma.location.findMany({
      where: { applicationId: id },
    });
    if (!location)
      throw new NotFoundException("Location not found for application");
    return location;
  }

  async updateLocationByApplication(
    id: string,
    dto: UpdateApplicationLocationDto,
    user: any
  ) {
    const app = await this.prisma.application.findUnique({
      where: { id },
    });
    if (!app) throw new NotFoundException("Application not found");
    // Only admin or supervisor update location via application
    if (user?.role !== "admin" && user?.role !== "supervisor")
      throw new ForbiddenException("Insufficient permissions");
    const location = await this.prisma.location.findFirst({
      where: { applicationId: id },
    });
    if (!location)
      throw new NotFoundException("Location not found for application");
    const updated = await this.prisma.location.update({
      where: { id: location.id },
      data: dto,
    });
    return updated;
  }

  async update(id: string, dto: UpdateApplicationDto, user: any) {
    const app = await this.prisma.application.findUnique({
      where: { id },
    });
    if (!app) throw new NotFoundException("Application not found");

    // Return application with linked location
    const result = await this.prisma.application.update({
      where: { id },
      data: {
        ...dto,
      },
      select: applicationSelect,
    });
    return result;
  }

  async remove(id: string, user: any) {
    const app = await this.prisma.application.findUnique({
      where: { id },
    });
    if (!app) throw new NotFoundException("Application not found");

    return this.prisma.application.delete({
      where: { id },
      select: applicationSelect,
    });
  }

  async getMyApplications(citizen: Citizen) {
    const applications = await this.prisma.application.findMany({
      where: { citizenId: citizen.id },
      select: baseApplicationSelect,
    });

    const citizenWithLocation = await this.prisma.citizen.findUnique({
      where: { id: citizen.id },
      select: citizenSelect,
    });

    return serializeMyApplicationsRes(applications, citizenWithLocation);
  }

  async trackApplicationById(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new Error("الطلب غير موجود");
    }

    return application;
  }

  async exportApplications(res: Response) {
    const applications = await this.prisma.application.findMany({
      include: { citizen: true },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Applications");

    sheet.columns = [
      { header: "Application ID", key: "id", width: 30 },
      { header: "Citizen Name", key: "name", width: 30 },
      { header: "Citizen Email", key: "email", width: 30 },
      { header: "Citizen Phone Number", key: "phone", width: 30 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];

    applications.forEach((u) => {
      sheet.addRow({
        id: u.id,
        name: u.citizen.full_name,
        email: u.citizen.email,
        phone: u.citizen.phone_number,
        createdAt: u.createdAt.toLocaleString(),
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=applications.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  async updateApplication(id: string, dto: CitizenUpdateApplicationDto) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { locations: true },
    });

    if (!application) {
      throw new NotFoundException("الطلب غير موجود");
    }

    const location = application.locations[0];

    if (!location) {
      throw new NotFoundException("الموقع غير موجود");
    }

   
    const locationData: any = {};

    if (dto.latitude) locationData.latitude = dto.latitude;
    if (dto.longitude) locationData.longitude = dto.longitude;
    if (dto.address) locationData.address = dto.address;
    if (dto.neighborhood) locationData.neighborhood = dto.neighborhood;

    if (Object.keys(locationData).length > 0) {
      await this.prisma.location.update({
        where: { id: location.id },
        data: locationData,
      });
    }

   
    const applicationData: any = {};

    if (dto.extraData) {
      applicationData.extraData = JSON.parse(dto.extraData);
    }

    if (Object.keys(applicationData).length === 0) {
      return application; // nothing to update
    }

    return await this.prisma.application.update({
      where: { id },
      data: applicationData,
    });
  }
}
