export const permissions = {
  application: {
    create: "application.create",
    view: "application.view",
    update: "application.update",
    delete: "application.delete",
    export: "application.export",
  },

  user: {
    create: "user.create",
    view: "user.view",
    update: "user.update",
    delete: "user.delete",
    export: "user.export",
  },

  citizen: {
    create: "citizen.create",
    view: "citizen.view",
    update: "citizen.update",
    delete: "citizen.delete",
    export: "citizen.export",
  },

  location: {
    create: "location.create",
    view: "location.view",
    update: "location.update",
    delete: "location.delete",
    export: "location.export",
  },

  bank: {
    create: "bank.create",
    view: "bank.view",
    update: "bank.update",
    delete: "bank.delete",
    export: "bank.export",
  },

  bank_account: {
    create: "bank-account.create",
    view: "bank-account.view",
    update: "bank-account.update",
    delete: "bank-account.delete",
    export: "bank-account.export",
  },

  role: {
    create: "role.create",
    view: "role.view",
    update: "role.update",
    delete: "role.delete",
    export: "role.export",
  },

  permission: {
    create: "permission.create",
    view: "permission.view",
    update: "permission.update",
    delete: "permission.delete",
    export: "permission.export",
  },
} as const;
