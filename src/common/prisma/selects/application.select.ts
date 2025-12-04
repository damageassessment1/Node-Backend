export const applicationSelect = {
  id: true,
  citizenId: true,
  application_date: true,
  status: true,
  notes: true,
  extraData: true, // Include extraData field
  createdById: true,
  createdAt: true,
  updatedAt: true,
  citizen: {
    select: {
      id: true,
      national_id: true,
      first_name: true,
      family_name: true,
    },
  },
  locations: { // Fix: should be plural and match schema
    select: {
      id: true,
      type: true,
      governorate: true,
      town: true,
      street: true,
      block_number: true,
      house_number: true,
      latitude: true,
      longitude: true,
      notes: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;
