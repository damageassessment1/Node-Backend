export const baseCitizenSelect = {
  id: true,
  national_id: true,
  avatar: true,
  first_name: true,
  father_name: true,
  grandfather_name: true,
  family_name: true,
  full_name: true,
  family_members_number: true,
  phone_number: true,
  whatsapp_number: true,
  email: true,
  verification_status: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const citizenProfileSelect = {
  ...baseCitizenSelect,
  place_of_birth: true,
  country: true,
  date_of_birth: true,
  gender: true,
  marital_status: true,
  status: true,

};

export const citizenSelect = {
  ...baseCitizenSelect,
  locations: {
    select: {
      id: true,
      type: true,
      address: true,
      neighborhood: true,
      governorate: true,
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
      updatedAt: true,
    },
  },
} as const;
