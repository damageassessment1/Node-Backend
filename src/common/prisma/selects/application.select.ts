export const applicationSelect = {
  id: true,
  citizenId: true,
  // locationId removed from Application model (use Location.applicationId)
  application_date: true,
  status: true,
  notes: true,
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
  location: {
    select: {
      id: true,
      type: true,
      governorate: true,
      town: true,
      street: true,
      block_number: true,
      house_number: true,
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
