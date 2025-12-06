import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UpdateApplicationDto } from "./dto/update-application.dto";
import { applicationSelect } from "src/common/prisma/selects";
import { UpdateApplicationLocationDto } from "./dto/update-application-location.dto";
import { AddLocationDto } from "./dto/add-location.dto";
import { AddExtraDataDto } from "./dto/add-extradata.dto";
import { generateApplicationId } from "src/common/utils";
import { Citizen, LocationType } from "@prisma/client";

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApplicationDto, user: any) {
    // Only admin can create
    if (user?.role !== "admin")
      throw new ForbiddenException("Insufficient permissions");

    // Verify citizen & location exist
    const citizen = await this.prisma.citizen.findUnique({
      where: { id: dto.citizenId },
    });
    if (!citizen) throw new NotFoundException("Citizen not found");
    const location = await this.prisma.location.findUnique({
      where: { id: dto.locationId },
    });
    if (!location) throw new NotFoundException("Location not found");
    if (location.applicationId)
      throw new ForbiddenException("Location already linked to an application");
    // Ensure the location belongs to the specified citizen
    if (location.citizenId !== dto.citizenId)
      throw new ForbiddenException(
        "Location does not belong to the specified citizen"
      );

    // Generate custom application ID
    const customId = generateApplicationId();

    // Create application and link location atomically
    const app = await this.prisma.application.create({
      data: {
        id: customId,
        citizenId: dto.citizenId,
        application_date: dto.application_date ?? new Date(),
        status: dto.status ?? "pending",
        notes: dto.notes ?? null,
        createdById: user?.id ?? null,
      },
    });
    // Link the created application to the location
    await this.prisma.location.update({
      where: { id: dto.locationId },
      data: { applicationId: app.id },
    });
    // Return application with linked location
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

    // Admin or supervisor can update
    if (user?.role !== "admin" && user?.role !== "supervisor")
      throw new ForbiddenException("Insufficient permissions");

    // If the locationId was changed, update location application mappings
    if (dto.locationId) {
      const currentLocation = await this.prisma.location.findFirst({
        where: { applicationId: id },
      });
      if (currentLocation && dto.locationId !== currentLocation.id) {
        // Clear previous location.applicationId
        await this.prisma.location.update({
          where: { id: currentLocation.id },
          data: { applicationId: null },
        });
      }
      // Set new location.applicationId
      const newLocation = await this.prisma.location.findUnique({
        where: { id: dto.locationId },
      });
      if (!newLocation) throw new NotFoundException("New location not found");
      // Ensure the new location belongs to the same citizen as the application
      if (newLocation.citizenId !== app.citizenId)
        throw new ForbiddenException(
          "New location does not belong to the same citizen as the application"
        );
      if (newLocation.applicationId)
        throw new ForbiddenException(
          "New location already linked to an application"
        );
      await this.prisma.location.update({
        where: { id: dto.locationId },
        data: { applicationId: id },
      });
    }
    const updated = await this.prisma.application.update({
      where: { id },
      data: dto,
    });
    // Return application with linked location
    const result = await this.prisma.application.findUnique({
      where: { id },
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

  async addLocationToApplication(
    dto: AddLocationDto,
    type: LocationType,
    user: Citizen
  ) {
    const app = await this.prisma.application.findFirst({
      where: { citizenId: user.id },
      include: { locations: true },
    });

    if (!app) throw new NotFoundException("Application not found");

    if (app.locations.some((loc) => loc.type === type)) {
      throw new ForbiddenException(
        `Application already has a ${type} location`
      );
    }
    // Create location for the citizen
    const location = await this.prisma.location.create({
      data: {
        ...dto,
        citizenId: app.citizenId,
        type,
        applicationId: app.id,
      },
    });
    return location;
  }

  async addExtraData(dto: AddExtraDataDto, user: Citizen) {
  const app = await this.prisma.application.findFirst({
    where: { citizenId: user.id },
  });

  if (!app) throw new NotFoundException("Application not found");

  const updated = await this.prisma.application.update({
    where: { id: app.id }, // 👈 unique field
    data: { extraData: dto.extraData },
  });

  return updated;
}

  async getMyApplicationInfo(user: Citizen) {
    const app = await this.prisma.application.findFirst({
      where: { citizenId: user.id },
      select: applicationSelect,
    });
    if (!app) throw new NotFoundException("Application not found");
    if (app.extraData && typeof app.extraData === "string") {
      try {
        app.extraData = JSON.parse(app.extraData);
      } catch {
        // If parsing fails, leave as is
        console.log("Failed to parse extraData JSON");
        
      }
    }
    return app;
  }
}
