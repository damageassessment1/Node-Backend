import { LocationType } from "@prisma/client";

export const serializeMyApplicationsRes = (applications: any[], user: any) => {
    const serializedApplications = applications.map((app) => {
      

      return {
        id: app.id,
        citizenId: app.citizenId,
        status: app.status,
        notes: app.notes,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        extraData: app.extraData,
        location: app.locations[0],
      };
    });

    const { locations, ...userData } = user;

    const currentLocation =
      locations?.find((loc) => loc.type === LocationType.CURRENT) ?? null;

    return {
      citizen: {
        ...userData,
        current_location: currentLocation,
      },
      applications: serializedApplications,
    };
  }