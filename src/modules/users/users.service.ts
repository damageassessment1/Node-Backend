import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreateUserDto, UpdateUserDto } from "./dto";
import * as bcrypt from "bcryptjs";
import { baseUserSelect } from "src/common/prisma/selects";
import * as ExcelJS from "exceljs";
import { Response } from "express";
import { Prisma, User } from "@prisma/client";
import { UserQueryDto } from "./dto/user-query.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException("User already exists");
    }

    // Hash password
    const hash = await bcrypt.hash(createUserDto.password, 10);

    try {
      // Create user
      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hash,
        },
        select: baseUserSelect,
      });

      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException("User already exists");
        }
      }
      throw error;
    }
  }

  async findAll(filters: UserQueryDto) {
    const { page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(filters.fullName && {
        name: {
          contains: filters.fullName,
          mode: "insensitive",
        },
      }),
      ...(filters.email && {
        email: {
          contains: filters.email,
          mode: "insensitive",
        },
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: baseUserSelect,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Check if email is being updated and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException("Email already exists");
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
        select: baseUserSelect,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException("Email already exists");
        }
      }
      throw error;
    }
  }

  async remove(id: number, authUser: User) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.id === authUser.id) {
      throw new BadRequestException("you can not delete this user");
    }

    try {
      return await this.prisma.user.delete({
        where: { id },
        select: baseUserSelect,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          throw new BadRequestException(
            "Cannot delete user because they have related records (e.g. created applications)"
          );
        }
      }
      throw error;
    }
  }



  async exportUsers(res: Response) {
    const users = await this.prisma.user.findMany({
      include: { role: true },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("users");

    sheet.columns = [
      { header: "User ID", key: "id", width: 30 },
      { header: "User Name", key: "name", width: 30 },
      { header: "User Email", key: "email", width: 30 },
      { header: "User Role", key: "role", width: 30 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];

    users.forEach((u) => {
      sheet.addRow({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role.name,
        createdAt: u.createdAt.toLocaleString(),
      });
    });

    res.setHeader(
      "Content-Type",
      "user/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  }
}
