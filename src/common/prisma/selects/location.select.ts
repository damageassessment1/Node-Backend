import { baseCitizenSelect } from "./citizen.select";

export const baseLocationSelect = {
  id: true,
  type: true,
  address: true,
  neighborhood: true,
  governorate: true,
  landmark: true,
  status: true,
  town: true,
  street: true,
  block_number: true,
  house_number: true,
  latitude: true,
  longitude: true,
  notes: true,
  extraData: true,
  createdAt: true,
  citizenId: true,
  applicationId: true,
  updatedAt: true,
} 

export const locationSelect = {
  ...baseLocationSelect,
  citizen: {
    select: {
      ...baseCitizenSelect,
    },
  },
} 
