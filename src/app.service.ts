import { Injectable } from "@nestjs/common";
import { PrismaService } from "./modules/database/prisma.service";
import { baseUserSelect, citizenSelect } from "./common/prisma/selects";

type User = any; // User type from request context

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  /**
   * Admin dashboard data
   * Returns all supervisors and all citizens in the system
   */
  async getAdminData(user: User) {
    const [users, citizens, applications,locations] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          ...baseUserSelect,
        },
      }),
      this.prisma.citizen.findMany({
        select: citizenSelect,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.application.findMany(),
      this.prisma.location.findMany(),
    ]);

    return { users, citizens,applications,locations };
  }

  /**
   * Supervisor dashboard data
   * Returns citizens assigned to this supervisor
   */
  async getSupervisorData(user: User) {
     const [ citizens, applications,locations] = await Promise.all([
      this.prisma.citizen.findMany({
        select: citizenSelect,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.application.findMany(),
      this.prisma.location.findMany(),
    ]);

    return {citizens,applications,locations };
  }


  async findApplicationById(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new Error("الطلب غير موجود");
    }

    return application;
  }
}
