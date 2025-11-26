# Damage Assessment Backend - AI Coding Agent Guide

## Project Overview

This is a **NestJS TypeScript backend** for a damage assessment system with **admin and supervisor dashboards**. Supervisors manage citizens undergoing damage assessment, and admins oversee the entire system.

**Key Tech Stack:**

- **Framework:** NestJS 11 (TypeScript)
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** JWT (Bearer tokens)
- **Storage:** Supabase
- **Scheduling:** @nestjs/schedule for periodic tasks
- **File Handling:** Multer (Express multipart uploads)

---

## Architecture & Data Model

### Core Entities (See `prisma/schema.prisma`)

- **User**: Admins/Supervisors only (role: `admin` | `supervisor`)
- **Citizen**: Citizens undergoing damage assessment (directly assigned to supervisors)
- **Location**: Damage locations associated with citizens (before/after war, temporary, current)
- **Notification**: User activity alerts

**Critical Enums:**

- `UserRole`: `admin`, `supervisor` (only 2 roles)
- `VerificationStatus`: `pending` → `national_id_verified` → `questions_verified` → `verified`
- `CitizenStatus`: `alive` | `dead`
- `LocationType`: `before_war`, `after_war`, `temporary`, `current`

### Simplified Data Flow

```
Admin
  ├─ Views all Supervisors
  ├─ Views all Citizens (with their assigned Supervisors)
  └─ Can assign/unassign Citizens to Supervisors

Supervisor
  └─ Views only Citizens assigned to them
```

---

## Dashboard Architecture

### Two Role-Based Dashboards

#### **Admin Dashboard** (`GET /admin-dashboard`)

**Purpose:** System-wide overview and management  
**Returns:**

- List of all supervisors
- List of all citizens in system with verification status
- Statistics: total citizens, assigned vs unassigned, verified count
- Location: `src/app.service.ts` → `getAdminData()`

**Sample Response:**

```json
{
  "supervisors": [
    {
      "id": 1,
      "name": "Ahmed",
      "email": "ahmed@example.com",
      "assignedCitizens": [
        { "id": 1, "first_name": "Ali", "national_id": "123", "verification_status": "verified" }
      ]
    }
  ],
  "citizens": [...],
  "totalCitizens": 150,
  "stats": {
    "totalSupervisors": 5,
    "assignedCitizens": 120,
    "unassignedCitizens": 30,
    "verifiedCitizens": 95
  }
}
```

#### **Supervisor Dashboard** (`GET /supervisor-dashboard`)

**Purpose:** Manage assigned citizens  
**Returns:**

- Citizens assigned to this supervisor
- Verification status breakdown
- Citizen details: national ID, verification status, locations
- Location: `src/app.service.ts` → `getSupervisorData()`

**Sample Response:**

```json
{
  "assignedCitizens": [
    {
      "id": 1,
      "first_name": "Ali",
      "national_id": "123",
      "verification_status": "verified",
      "locations": [...],
      "createdAt": "2025-11-25T..."
    }
  ],
  "stats": {
    "total": 25,
    "byVerificationStatus": {
      "pending": 5,
      "national_id_verified": 10,
      "questions_verified": 3,
      "verified": 7
    }
  }
}
```

---

## Authentication Flow

- **Public endpoints** use `@Public()` decorator (e.g., `/auth/signup`, `/keep-alive`)
- **Protected endpoints** require JWT token in `Authorization: Bearer <token>` header
- **Role-based guards** use `@UseGuards(RolesGuard('admin'))` or `RolesGuard('supervisor')`
- **Admin sign-in** available at `POST /auth/signin` that returns a JWT token for admin or supervisor users (payload contains `sub`, `type`, `email`, `role`).
- **AuthGuard** (`src/common/guards/auth.guard.ts`) validates token and attaches user to request
- **RolesGuard** (`src/common/guards/roles.guard.ts`) checks user role against required roles

---

## Module Structure

### `auth/` - Authentication

- SignUp/SignIn DTOs with validation
- `AuthService.verifyNationalId()` - Validates national IDs (currently stubbed)
- JWT token generation (needs implementation)
- Citizen authentication flow

### `citizens/` - Citizen Management

- CRUD endpoints to manage citizens (admin + supervisors)
- Plural endpoints are in `src/modules/citizens/`
- Authorization:
  - `POST /citizens` (admin only)
  - `GET /citizens` (admin & supervisor; supervisors can read all citizens but cannot modify them)
  - `GET /citizens/:id` (admin & assigned supervisor)
  - `PATCH /citizens/:id` (admin & assigned supervisor)
  - `PATCH /citizens/:id/assign` (REMOVED) — assignment handled via admin role and UI logic (no DB field)
  - `DELETE /citizens/:id` (admin only)

### `users/` - User Management (Admin/Supervisor)

- CRUD operations for admins/supervisors
- `searchSupervisors()` - Fuzzy search by name/email
- Password hashing with bcryptjs
- Email uniqueness validation

### `database/` - Prisma Integration

- `PrismaService` - Singleton connection wrapper
- Used across all services for queries

### `storage/` - File Management

- Supabase integration for file uploads
- Used for citizen documents

---

## Key Patterns & Conventions

### Guard Composition

```typescript
// RolesGuard is a factory that returns a Guard class
@UseGuards(RolesGuard('admin'))
getAdminData() { ... }

// String literals only: 'admin' | 'supervisor'
// Never use Prisma enums directly
```

### User Selection

- **`baseUserSelect`** (`src/common/prisma/selects/user.select.ts`) - Excludes password field
- Always use when querying users: `select: baseUserSelect`
- Prevents accidental password leaks

### Request User Injection

```typescript
@Get()
getData(@User() user: User) {
  // user is automatically injected by AuthGuard
}
```

### Citizen Assignment

```typescript
// Assign citizen to supervisor
await prisma.citizen.update({
  where: { id: citizenId },
  data: { supervisorId: supervisorId },
});

// Get supervisor's citizens
await prisma.citizen.findMany({
  where: { supervisorId: supervisorId },
});
```

### Error Handling

- **ConflictException** - Duplicate email/national ID
- **NotFoundException** - User/citizen not found
- **ForbiddenException** - Auth/role failure
- **UnauthorizedException** - Invalid token

### Prisma Query Optimization

- Use `Promise.all()` for parallel queries (see dashboards)
- Always `select` or `include` to prevent N+1
- Use string literals for enums: `where: { role: 'supervisor' }`
- Use `mode: "insensitive"` for case-insensitive search

---

## Development Commands

```bash
# Install deps
npm install

# Watch mode (auto-recompile)
npm run start:dev

# Generate Prisma client from schema
npx prisma generate

# Run migrations
npx prisma migrate dev --name <migration_name>

# View database UI
npx prisma studio

# Format code
npm run format

# Lint
npm run lint

# Tests
npm test

# Docker dev
docker-compose up
```

---

## Key Files to Know

| File                                                 | Purpose                                 |
| ---------------------------------------------------- | --------------------------------------- |
| `src/app.controller.ts`                              | Dashboard routes + role guards          |
| `src/app.service.ts`                                 | Dashboard data logic (admin/supervisor) |
| `src/common/guards/auth.guard.ts`                    | JWT validation + user attachment        |
| `src/common/guards/roles.guard.ts`                   | Role-based access control               |
| `src/common/decorators/user.decorator.ts`            | @User() injection                       |
| `src/common/decorators/public-endpoint.decorator.ts` | @Public() marking                       |
| `src/common/prisma/selects/user.select.ts`           | Safe user field selection               |
| `prisma/schema.prisma`                               | Database schema                         |
| `.env`                                               | JWT_SECRET, DATABASE_URL, SUPABASE keys |

---

## Next Implementation Tasks

- [ ] Complete citizen authentication (national ID verification, password setup)
- [ ] Implement endpoint to assign/unassign citizens to supervisors
- [ ] Add pagination to admin dashboard citizen list
- [ ] Implement citizen verification workflow (update verification_status)
- [ ] Add filtering by verification_status and citizen_status
- [ ] Implement sorting (by name, date, verification status)
- [ ] Add notification system for assignments
- [ ] Complete file upload endpoints for citizen documents
- [ ] Implement audit logging for admin actions

---

## Database Schema Quick Reference

### User Model

```prisma
- id: Int
- name: String
- email: String (unique)
- role: UserRole (admin | supervisor)
- password: String (hashed)
- assignedCitizens: Citizen[] (only for supervisors)
```

### Citizen Model

```prisma
- id: Int
- national_id: String (unique)
- first_name, father_name, family_name: String
- verification_status: VerificationStatus
- status: CitizenStatus (alive | dead)
- supervisorId: Int? (nullable - can be unassigned)
- locations: Location[]
```

### Location Model

```prisma
- id: Int
- citizenId: Int
- type: LocationType (before_war | after_war | temporary | current)
- governorate, town, street, block_number, house_number: String
- latitude, longitude: Decimal
```

---

## Integration Points

- **Supabase:** File storage for citizen documents
- **JWT:** Token validation via `.env` JWT_SECRET
- **Prisma:** All database queries through PrismaService
- **NestJS Guards:** AuthGuard (all routes) → RolesGuard (role-protected routes)
