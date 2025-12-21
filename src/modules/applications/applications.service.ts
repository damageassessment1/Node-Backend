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
import { AddExtraDataDto } from "./dto/add-extradata.dto";
import { generateApplicationId } from "src/common/utils";
import { Citizen, LocationType } from "@prisma/client";
import * as ExcelJS from "exceljs";
import { Response } from "express";
import { StorageService } from "../storage/storage.service";
import {
  AddCurrentLocationDto,
  AddPreviousLocationDto,
} from "./dto/add-location.dto";
import { baseApplicationSelect } from "src/common/prisma/selects/application.select";
import { serializeMyApplicationsRes } from "src/common/serializers/application.serializer";

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private readonly storageService: StorageService
  ) {}

  async create(dto: CreateApplicationDto, user: any) {
    // Only admin can create
    if (user?.role !== "admin")
      throw new ForbiddenException("Insufficient permissions");

    // Verify citizen exists
    const citizen = await this.prisma.citizen.findUnique({
      where: { id: dto.citizenId },
    });
    if (!citizen) throw new NotFoundException("Citizen not found");

    // Check if citizen already has an application
    const existingApplication = await this.prisma.application.findUnique({
      where: { citizenId: dto.citizenId },
    });
    if (existingApplication)
      throw new ConflictException(
        "An application has already been created for this citizen"
      );

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

    // // If locationId provided, link it to the application
    // if (dto.locationId) {
    //   const location = await this.prisma.location.findUnique({
    //     where: { id: dto.locationId },
    //   });
    //   if (!location) throw new NotFoundException("Location not found");
    //   if (location.applicationId)
    //     throw new ForbiddenException("Location already linked to an application");
    //   // Ensure the location belongs to the specified citizen
    //   if (location.citizenId !== dto.citizenId)
    //     throw new ForbiddenException(
    //       "Location does not belong to the specified citizen"
    //     );

    //   // Link location to application
    //   await this.prisma.location.update({
    //     where: { id: dto.locationId },
    //     data: { applicationId: app.id },
    //   });
    // }

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

    // Only admin can delete
    if (user?.role !== "admin")
      throw new ForbiddenException("Insufficient permissions");
    // Clear location mapping before deleting the application
    const currentLocation = await this.prisma.location.findFirst({
      where: { applicationId: id },
    });
    if (currentLocation) {
      await this.prisma.location
        .update({
          where: { id: currentLocation.id },
          data: { applicationId: null },
        })
        .catch(() => {});
    }

    return this.prisma.application.delete({
      where: { id },
      select: applicationSelect,
    });
  }

  async createApplicationAndLocation(
    dto: AddPreviousLocationDto,
    type: LocationType,
    citizen: Citizen,
    uploads?: {
      beforeWarImage?: Express.Multer.File;
      afterWarImage?: Express.Multer.File;
      ownershipDocuments?: Express.Multer.File[];
    }
  ) {
    const { extraData, ...locationDto } = dto;
    let applicationExtraData = extraData ? JSON.parse(dto.extraData) : {};

    if (uploads && uploads.beforeWarImage) {
      const [file] = await this.handleUploads(
        uploads.beforeWarImage,
        "before_war_image"
      );
      applicationExtraData.beforeWarImage = file;
    }

    if (uploads && uploads.afterWarImage) {
      const [file] = await this.handleUploads(
        uploads.afterWarImage,
        "after_war_image"
      );
      applicationExtraData.afterWarImage = file;
    }

    if (uploads && uploads.ownershipDocuments) {
      applicationExtraData.ownershipDocuments = await this.handleUploads(
        uploads.ownershipDocuments,
        "ownership_documents"
      );
    }

    const result = await this.prisma.$transaction(async (prisma) => {
      // Create application for the citizen
      const application = await prisma.application.create({
        data: {
          id: generateApplicationId(),
          citizenId: citizen.id,
          extraData: applicationExtraData,
        },
      });

      // Create location for the citizen
      const location = await prisma.location.create({
        data: {
          ...locationDto,
          citizenId: application.citizenId,
          type,
          applicationId: application.id,
        },
      });

      // The transaction commits if both operations are successful
      return { application, location };
    });

    return result;
  }

  async addCurrentLocation(
    dto: AddCurrentLocationDto,
    type: LocationType,
    citizen: Citizen
  ) {
    const currentLocation = this.prisma.location.findMany({
      where: { citizenId: citizen.id, type: LocationType.CURRENT },
    });

    const currentLocationExists = (await currentLocation).length >= 1;
    if (currentLocationExists) {
      throw new NotFoundException("This user already has a current location");
    }

    const location = await this.prisma.location.create({
      data: {
        ...dto,
        citizenId: citizen.id,
        type,
      },
    });
    return location;
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

  // helper fucntions

  private async handleUploads(
    files?: Express.Multer.File | Express.Multer.File[],
    folder?: string
  ): Promise<
    Array<{
      path: string;
      url: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
    }>
  > {
    if (!files) return [];

    // Multiple files
    if (Array.isArray(files)) {
      return await this.storageService.uploadFiles(files, folder || "files");
    }

    // Single file
    const uploaded = await this.storageService.uploadOneFile(
      files,
      folder || "files"
    );
    return [uploaded]; // normalize to array
  }


}
