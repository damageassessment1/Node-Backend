import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { ACTIONS, ENTITIES } from "src/common/constats/permissions.constants";

const prisma = new PrismaClient();

async function main() {
  // -------------------------
  // PERMISSIONS
  // -------------------------


  const permissionsData = ENTITIES.flatMap(entity =>
    ACTIONS.map(action => ({
      key: `${entity}.${action}`,
      description: `${action} ${entity}`,
    }))
  );

  await prisma.permission.createMany({
    data: permissionsData,
    skipDuplicates: true,
  });

  const allPermissions = await prisma.permission.findMany();

  // -------------------------
  // SUPER ADMIN ROLE
  // -------------------------
  const superAdminRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: {
      name: "SUPER_ADMIN",
      description: "Full system access",
    },
  });

  // assign all permissions to role
  await prisma.rolePermission.createMany({
    data: allPermissions.map(p => ({
      roleId: superAdminRole.id,
      permissionId: p.id,
    })),
    skipDuplicates: true,
  });

  // -------------------------
  // SUPER ADMIN USER
  // -------------------------
  const hashedPassword = await bcrypt.hash("SplinterCell@1984", 10);

  await prisma.user.upsert({
    where: { email: "mohfarra1984@gmail.com" },
    update: {
      roleId: superAdminRole.id,
    },
    create: {
      name: "Mohammed Farra",
      email: "mohfarra1984@gmail.com",
      password: hashedPassword,
      roleId: superAdminRole.id,
    },
  });

  console.log("✅ Seed completed successfully");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
