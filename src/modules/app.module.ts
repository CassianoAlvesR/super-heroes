import { Module } from '@nestjs/common';
import { HeroesModule } from './heroes/heroes.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './shared/prisma/prisma.module';
import configuration from '../config/configuration';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import { DayjsModule } from './shared/dayjs/dayjs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    HeroesModule,
    TasksModule,
    DayjsModule,
  ],
})
export class AppModule {}
