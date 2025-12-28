import { LocationType } from "@prisma/client";

export type LocationFilters = {
  applicationId?: string;
  fullName?: string;
  nationalId?: string;
  type?: LocationType;
  neighborhood?: string;
};
