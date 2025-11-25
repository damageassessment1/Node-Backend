import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './modules/database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { KeepAliveService } from './keep-alive.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
    AuthModule,
    DatabaseModule,
    UsersModule,
  ],
  providers:[AppService,KeepAliveService],
  controllers:[AppController]

})
export class AppModule {}
