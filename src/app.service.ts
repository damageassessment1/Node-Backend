import { Injectable } from "@nestjs/common";
import { PrismaService } from "./modules/database/prisma.service";
import { baseUserSelect, citizenSelect } from "./common/prisma/selects";

type User = any; // User type from request context

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

}
