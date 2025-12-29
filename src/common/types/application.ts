import { ApplicationStatus } from "@prisma/client";

export type ApplicationFilters = {
  status?: ApplicationStatus;
  applicationId?: string;
  fullName?: string;
  nationalId?: string;
  phone?: string;
};
