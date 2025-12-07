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
    const [supervisors, citizens, totalCitizens] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: "supervisor" },
        select: {
          ...baseUserSelect,
        },
      }),
      this.prisma.citizen.findMany({
        select: citizenSelect,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.citizen.count(),
    ]);

    return {
      supervisors,
      citizens,
      totalCitizens,
      stats: {
        totalSupervisors: supervisors.length,
        assignedCitizens: 0,
        unassignedCitizens: citizens.length,
        verifiedCitizens: citizens.filter(
          (c) => c.verification_status === "verified"
        ).length,
      },
    };
  }

  /**
   * Supervisor dashboard data
   * Returns citizens assigned to this supervisor
   */
  async getSupervisorData(user: User) {
    // Supervisors can read all citizens (no per-supervisor assignment)
    const assignedCitizens = await this.prisma.citizen.findMany({
      select: citizenSelect,
      orderBy: { createdAt: "desc" },
    });
    const stats = assignedCitizens.reduce(
      (acc, c) => {
        acc[c.verification_status] = (acc[c.verification_status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      assignedCitizens,
      stats: {
        total: assignedCitizens.length,
        byVerificationStatus: stats,
      },
    };
  }
}
