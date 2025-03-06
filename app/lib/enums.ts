export enum Role {
  ADMIN = 'SA', // Super Admin (Carobar admins)
  MANAGER = 'CA', // Company Admin (Elevated role for company in charge)
  STAFF = 'CU', // Standard Company User
}

// You can also export other enums here if needed in the future
/**
 * HTTP Status codes used in this file
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}
