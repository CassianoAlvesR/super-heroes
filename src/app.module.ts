import { Module } from '@nestjs/common';
import { HeroesModule } from './modules/heroes/heroes.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/shared/prisma/prisma.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    HeroesModule,
  ],
})
export class AppModule {}
