import "dotenv/config";
import { NestFactory, Reflector } from "@nestjs/core";
import * as express from "express";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AuthGuard } from "./common/guards/auth.guard";
import { JsonBodyExceptionFilter } from "./common/filters/json-body-exception.filter";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "./modules/database/prisma.service";
import * as bcrypt from "bcryptjs";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Register a global exception filter for JSON parse errors and all exceptions to return friendlier JSON message
  app.useGlobalFilters(
    new JsonBodyExceptionFilter(),
    new AllExceptionsFilter()
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    })
  );
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Enable form and raw text parsers to support clients that send urlencoded and text/plain bodies
  app.use(express.urlencoded({ extended: true }));
  app.use(express.text({ type: "text/*" }));

  const reflector = app.get(Reflector);
  const jwtService = app.get(JwtService);
  const prismaService = app.get(PrismaService);

  // Disable authentication if DISABLE_AUTH=true (useful for local testing/dashboard dev)
  if (process.env.DISABLE_AUTH !== "true") {
    app.useGlobalGuards(new AuthGuard(reflector, jwtService, prismaService));
  }

  // Seed super admin if configured
  try {
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    if (superAdminEmail && superAdminPassword) {
      const existing = await prismaService.user.findUnique({
        where: { email: superAdminEmail },
      });
      if (!existing) {
        const hash = await bcrypt.hash(superAdminPassword, 10);
        await prismaService.user.create({
          data: {
            email: superAdminEmail,
            name: "Super Admin",
            password: hash,
            role: "admin",
          },
        });
        console.log("Super admin seeded:", superAdminEmail);
      }
    }
  } catch (err) {
    console.error("Failed to seed super admin", err);
  }

  // Serve static files
  app.useStaticAssets(join(__dirname, "..", "uploads"));

  // Enable CORS
  app.enableCors();

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
