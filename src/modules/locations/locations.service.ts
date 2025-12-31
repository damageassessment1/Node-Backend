import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreateLocationDto } from "./dto/create-location.dto";
import { UpdateLocationDto } from "./dto/update-location.dto";
import { locationSelect } from "src/common/prisma/selects";
import { Citizen, LocationType, Prisma } from "@prisma/client";
import {
  AddCurrentLocationDto,
  AddPreviousLocationDto,
} from "./dto/add-location.dto";
import { generateApplicationId } from "src/common/utils";
import { StorageService } from "../storage/storage.service";
import { baseCitizenSelect } from "src/common/prisma/selects/citizen.select";
import { LocationQueryDto } from "./dto/location-query.dto";

@Injectable()
export class LocationsService {
  constructor(
    private prisma: PrismaService,
    private readonly storageService: StorageService
  ) {}

  async create(dto: CreateLocationDto, user: any) {
    const loc = await this.prisma.location.create({
      data: {
        ...dto,
        citizenId: dto.citizenId,
      },
      select: locationSelect,
    });

    return loc;
  }

  async findAll(filters: LocationQueryDto) {
    const { page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.LocationWhereInput = {
      ...(filters.applicationId && { applicationId: filters.applicationId }),
      ...(filters.neighborhood && {
        neighborhood: { contains: filters.neighborhood, mode: "insensitive" },
      }),
      ...(filters.fullName || filters.nationalId
        ? {
            citizen: {
              ...(filters.fullName && {
                full_name: { contains: filters.fullName, mode: "insensitive" },
              }),
              ...(filters.nationalId && { national_id: filters.nationalId }),
            },
          }
        : {}),
      ...(filters.type && { type: filters.type }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.location.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        where,
        include: { citizen: { select: { ...baseCitizenSelect } } },
      }),
      this.prisma.location.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        pagesCount: Math.ceil(total / limit),
        total,
      },
    };
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

  async addPreviousLocation(
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

    // handle images
    if (uploads && uploads.beforeWarImage) {
      const [file] = await this.storageService.handleUploads(
        uploads.beforeWarImage,
        "before_war_image"
      );
      applicationExtraData.beforeWarImage = file;
    }

    if (uploads && uploads.afterWarImage) {
      const [file] = await this.storageService.handleUploads(
        uploads.afterWarImage,
        "after_war_image"
      );
      applicationExtraData.afterWarImage = file;
    }

    if (uploads && uploads.ownershipDocuments) {
      applicationExtraData.ownershipDocuments =
        await this.storageService.handleUploads(
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

      return { application, location };
    });

    return result;
  }

  async addCurrentLocation(
    dto: AddCurrentLocationDto,
    type: LocationType,
    citizen: Citizen
  ) {
    const existingLocation = await this.prisma.location.findFirst({
      where: {
        citizenId: citizen.id,
        type: LocationType.CURRENT,
      },
    });

    if (existingLocation) {
      // update
      return this.prisma.location.update({
        where: { id: existingLocation.id },
        data: {
          ...dto,
        },
      });
    }

    // create
    return this.prisma.location.create({
      data: {
        ...dto,
        citizenId: citizen.id,
        type: LocationType.CURRENT,
      },
    });
  }

  // helper fucntions
}
