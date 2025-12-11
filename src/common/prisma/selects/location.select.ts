import { baseCitizenSelect } from "./citizen.select";

export const locationSelect = {
  id: true,
  type: true,
  governorate: true,
  // town: true,
  // street: true,
  // block_number: true,
  // house_number: true,
  latitude: true,
  longitude: true,
  notes: true,
  applicationId: true,
  citizen: {
    select: {
      ...baseCitizenSelect,
    },
  },
  createdAt: true,
  updatedAt: true,
} as const;
