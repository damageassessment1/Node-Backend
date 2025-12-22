export const API_PREFIX = "/api";

export const ADMIN_AUTH_ROUTE_PREFIX = "auth/admin";
export const CITIZEN_AUTH_ROUTE_PREFIX = "auth/citizen";
export const ADMIN_USERS_ROUTE_PREFIX = "admin/users";
export const ADMIN_CITIZENS_ROUTE_PREFIX = "admin/citizens";
export const ADMIN_APPLICATIONS_ROUTE_PREFIX = "admin/applications";
export const ADMIN_LOCATIONS_ROUTE_PREFIX = "admin/locations";
export const CITIZEN_LOCATIONS_ROUTE_PREFIX = "citizen/locations";
export const ADMIN_BANK_ACCOUNTS_ROUTE_PREFIX = "admin/bank-accounts";
export const CITIZEN_APPLICATIONS_ROUTE_PREFIX = "citizen/applications";
export const CITIZEN_BANK_ACCOUNTS_ROUTE_PREFIX = "citizen/bank-accounts";


export const APPLICATION_ID_PARAM = "applicationId";
export const CITIZEN_ID_PARAM = "citizenId";
export const LOCATION_ID_PARAM = "locationId";
export const ACCOUNT_ID_PARAM = "accountId";
export const USER_ID_PARAM = "userId";

export const AUTH_ROUTES = {
  ADMIN: {
    SIGNIN: "signin",
    SIGNUP: "signup",
    CHANGE_PASSWORD: "change-password",
  },
  CITIZEN: {
    LOGIN: "login",
    VERIFY_ID: "verify-id",
    VERIFY_QUESTIONS: "verify-questions",
    COMPLETE_SIGNUP: "complete-signup",
    CHANGE_PASSWORD: "change-password",
  },
};

export const ADMIN_ROUTES = {
  USERS_EXPORT: "export",

  CITIZENS_EXPORT: "export",

  APPLICATIONS_EXPORT: "export",

  BANK_ACCOUNTS_EXPORT: "export",
};

export const CITIZEN_ROUTES = {
  APPLICATION_TRACK: "track",

  LOCATIONS: {
    CURRENT: "current",
    PREVIOUS: "previous",
  },

  BANK_ACCOUNTS: "/citizen/bank-accounts",
};

export const STATS_ROUTES = {
  PREFIX: "stats",
  ADMIN_DASHBOARD: "admin-dashboard",
  SUPERVISOR_DASHBOARD: "supervisor-dashboard",
};
